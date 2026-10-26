// 這個檔案放在 app/interview/route.ts，所以在 App Router 裡它會變成 /interview 這個 API 路徑。
// 前端每次呼叫都會把「職缺、總題數、目前為止的完整對話」一起送過來，
// 伺服器本身不記住任何狀態（stateless），只靠送來的對話判斷現在該出題還是該評分。

// OpenAI 官方 SDK，用來呼叫 Chat Completions API
import OpenAI from "openai";
// 前後端共用的常數與型別，放在 lib/interview.ts，確保兩邊格式一致
import {
  API_KEY_HEADER, // 前端放使用者 API 金鑰的 header 名稱
  MAX_QUESTIONS, // 最多可選幾題（10）
  MIN_QUESTIONS, // 最少可選幾題（1）
  type ChatMessage, // 單則對話：{ role: "assistant" | "user", content: string }
  type Evaluation, // 最終評分結果的格式
  type InterviewRequest, // 前端送來的請求格式
  type InterviewResponse, // 回傳給前端的格式（出題 或 評分）
} from "@/lib/interview";

// BYOK（自備金鑰）模式：不使用伺服器的環境變數，而是每次請求從 header 讀取使用者自己的金鑰，
// 用完即丟，伺服器不會儲存或記錄它
// 使用的模型；可以在 .env.local 設定 OPENAI_MODEL 覆蓋，沒設定就用 gpt-4o-mini
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

// 輸入長度上限，避免有人送超長內容造成浪費 token 或濫用
const MAX_JOB_TITLE_LENGTH = 100;
const MAX_ANSWER_LENGTH = 2000;
const MAX_API_KEY_LENGTH = 300;

// 產生「面試官」角色的系統提示詞（system prompt），每出一題都會呼叫一次
// questionNumber：現在要出第幾題；totalQuestions：總共幾題
function interviewerPrompt(jobTitle: string, questionNumber: number, totalQuestions: number) {
  return `你是一位專業、友善但嚴謹的面試官，正在面試應徵「${jobTitle}」職缺的候選人。
請全程使用繁體中文。
這是第 ${questionNumber} / ${totalQuestions} 題。
規則：
${
  // 第一題和之後的題目指示不同：
  // 第一題 → 候選人還沒回答過，所以要打招呼、說明題數（避免 AI 說出「謝謝你的分享」這種怪話）
  // 之後的題目 → 先簡短回應上一題的回答，再出下一題
  questionNumber === 1
    ? `- 這是面試的開場，候選人還沒有回答過任何問題。請用一句話打招呼並說明會有 ${totalQuestions} 題，然後提出第一題。`
    : "- 先用一兩句話簡短回應候選人上一題的回答（不要在這裡給分數）。"
}
- 提出題目時：可以針對候選人上一個回答追問細節，也可以換一個與此職缺相關的新面向（技術能力、專案經驗、情境題、軟實力等）。
- 一次只問一個問題，問題要具體、與職缺高度相關。
- 不要在開頭標示題號。`;
}

// 產生「評分官」角色的系統提示詞，只在所有題目都回答完後呼叫一次
// 要求 AI 只輸出指定格式的 JSON，方便前端直接拿來顯示
function evaluatorPrompt(jobTitle: string, totalQuestions: number) {
  return `你是一位資深面試官，剛完成對應徵「${jobTitle}」職缺候選人的 ${totalQuestions} 題面試。
請根據對話紀錄，以繁體中文給出客觀的評分與具體建議。
只輸出 JSON，格式如下：
{
  "score": 0-100 的整數總分,
  "summary": "整體評價（2-3 句）",
  "strengths": ["優點1", "優點2"],
  "improvements": ["具體改進建議1", "具體改進建議2"],
  "perQuestion": [
    {
      "question": "題目摘要",
      "feedback": "針對該題回答的回饋",
      "betterAnswer": "答題策略：<一句話說明答題策略，例如 STAR 結構、先結論後細節>\\n\\n範例回答：<以候選人第一人稱寫一段 80-150 字、可以直接照著說的完整回答>",
      "score": 0-10 的整數
    }
  ]
}
perQuestion 需要剛好 ${totalQuestions} 筆，依照提問順序。
每一題的 betterAnswer 都必須同時包含「答題策略」與「範例回答」兩段。`;
}

// 驗證前端送來的資料。API 是公開的，任何人都能直接呼叫，所以不能信任輸入。
// 格式正確 → 回傳整理過的資料；任何一項不合格 → 回傳 null
function parseBody(body: unknown): InterviewRequest | null {
  // body 必須是物件
  if (typeof body !== "object" || body === null) return null;
  const { jobTitle, totalQuestions, messages } = body as Record<string, unknown>;

  // 職缺：必須是字串，去掉前後空白後不能是空的，也不能太長
  if (typeof jobTitle !== "string") return null;
  const trimmedTitle = jobTitle.trim();
  if (!trimmedTitle || trimmedTitle.length > MAX_JOB_TITLE_LENGTH) return null;

  // 題數：必須是整數，且在 1～10 之間
  if (
    typeof totalQuestions !== "number" ||
    !Number.isInteger(totalQuestions) ||
    totalQuestions < MIN_QUESTIONS ||
    totalQuestions > MAX_QUESTIONS
  ) {
    return null;
  }

  // 對話紀錄：必須是陣列；每題最多一問一答，所以長度不會超過 題數 × 2
  if (!Array.isArray(messages) || messages.length > totalQuestions * 2) return null;

  // 逐則檢查：role 只能是 assistant（面試官）或 user（候選人），content 必須是字串且不能太長
  // 這也防止有人偷塞 role: "system" 去改寫 AI 的指示
  for (const m of messages) {
    if (typeof m !== "object" || m === null) return null;
    const { role, content } = m as Record<string, unknown>;
    if (role !== "assistant" && role !== "user") return null;
    if (typeof content !== "string" || content.length > MAX_ANSWER_LENGTH) return null;
  }

  return { jobTitle: trimmedTitle, totalQuestions, messages: messages as ChatMessage[] };
}

// 處理 POST /interview 請求（App Router 中，route.ts 匯出名為 POST 的函式就代表處理 POST）
export async function POST(request: Request) {
  // 從 header 取出使用者的 API 金鑰；沒帶或格式明顯不對就直接回 401，不用浪費時間呼叫 OpenAI
  const apiKey = request.headers.get(API_KEY_HEADER)?.trim();
  if (!apiKey || apiKey.length > MAX_API_KEY_LENGTH || /\s/.test(apiKey)) {
    return Response.json({ error: "請先到設定頁輸入你的 OpenAI API 金鑰" }, { status: 401 });
  }
  // 每個請求用該使用者的金鑰建立自己的客戶端
  const client = new OpenAI({ apiKey });

  // 解析 JSON；如果 body 根本不是合法 JSON，.catch 會讓它變成 null，交給 parseBody 判定為錯誤
  const parsed = parseBody(await request.json().catch(() => null));
  if (!parsed) {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }
  const { jobTitle, totalQuestions, messages } = parsed;

  // 核心判斷依據：候選人已經回答了幾題（數 role 為 user 的訊息數量）
  const answered = messages.filter((m) => m.role === "user").length;

  try {
    // ===== 情況一：還沒答完 → 請 AI 面試官出下一題 =====
    if (answered < totalQuestions) {
      // 已答 0 題 → 出第 1 題；已答 1 題 → 出第 2 題，以此類推
      const questionNumber = answered + 1;
      const completion = await client.chat.completions.create({
        model: MODEL,
        messages: [
          // 第一則是系統提示詞，告訴 AI 它的角色和規則
          { role: "system", content: interviewerPrompt(jobTitle, questionNumber, totalQuestions) },
          // 接著放入完整的歷史對話，讓 AI 知道前面問過什麼、候選人怎麼答，才能追問
          // 如果是剛開始（沒有任何對話），補一則「請開始面試。」當作觸發，
          // 因為部分模型在只有 system 訊息時表現不穩定
          ...(messages.length > 0 ? messages : [{ role: "user" as const, content: "請開始面試。" }]),
        ],
      });
      // 取出 AI 的回覆文字（用 ?. 和 ?? 防止回應是空的時候程式出錯）
      const reply = completion.choices[0]?.message.content?.trim() ?? "";
      // 回傳 done: false 告訴前端「面試還在進行」，並附上題號讓前端更新進度條
      // satisfies 讓 TypeScript 檢查回傳格式符合 InterviewResponse
      return Response.json({ done: false, reply, questionNumber } satisfies InterviewResponse);
    }

    // ===== 情況二：全部答完 → 請 AI 評分 =====
    // 把對話整理成一份「逐字稿」純文字，交給評分官閱讀
    // 這裡不直接傳 messages 陣列，因為評分官是旁觀者角色，不是在跟候選人對話
    const transcript = messages
      .map((m) => `${m.role === "assistant" ? "面試官" : "候選人"}：${m.content}`)
      .join("\n\n");
    const completion = await client.chat.completions.create({
      model: MODEL,
      // JSON 模式：強制 AI 只輸出合法 JSON，避免它多講廢話導致 JSON.parse 失敗
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: evaluatorPrompt(jobTitle, totalQuestions) },
        { role: "user", content: transcript },
      ],
    });
    // 把 AI 回傳的 JSON 字串轉成物件
    const evaluation = JSON.parse(completion.choices[0]?.message.content ?? "{}") as Evaluation;
    // 回傳 done: true 告訴前端「面試結束」，前端就會切換到結果頁
    return Response.json({ done: true, evaluation } satisfies InterviewResponse);
  } catch (error) {
    // 金鑰錯誤與額度問題是使用者自己能處理的，回傳明確的訊息
    if (error instanceof OpenAI.AuthenticationError) {
      return Response.json({ error: "API 金鑰無效，請到設定頁重新輸入" }, { status: 401 });
    }
    if (error instanceof OpenAI.RateLimitError) {
      return Response.json(
        { error: "OpenAI 額度不足或請求太頻繁，請確認帳號餘額後再試" },
        { status: 429 },
      );
    }
    // 其他失敗（網路問題、JSON 解析失敗等）：詳細錯誤只印在伺服器終端機，回給前端通用訊息
    // 只印 message，避免把含金鑰資訊的完整請求物件寫進 log
    console.error(error instanceof Error ? error.message : error);
    return Response.json({ error: "AI 服務暫時無法使用，請稍後再試" }, { status: 502 });
  }
}
