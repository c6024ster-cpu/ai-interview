import Link from "next/link";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "@/lib/interview";

const FEATURES = [
  {
    tag: "01",
    title: "依職缺量身出題",
    body: "輸入任何職缺名稱，AI 面試官會從技術能力、專案經驗、情境題到軟實力，問出真正相關的問題。",
  },
  {
    tag: "02",
    title: "會追問的面試官",
    body: "不是固定題庫。面試官會根據你剛才的回答追問細節，就像真人面試一樣步步深入。",
  },
  {
    tag: "03",
    title: "自訂練習長度",
    body: `從 ${MIN_QUESTIONS} 題快速暖身到 ${MAX_QUESTIONS} 題完整模擬，依照你手上的時間決定練習強度。`,
  },
  {
    tag: "04",
    title: "評分與範例回答",
    body: "結束後取得總分、優缺點與逐題回饋，每一題都附上答題策略和一段可以直接參考的範例回答。",
  },
];

const STEPS = [
  { title: "輸入職缺與題數", body: "例如「前端工程師」、5 題。" },
  { title: "逐題回答", body: "像真實面試一樣作答，面試官會即時回應與追問。" },
  { title: "拿到評分報告", body: "看分數、讀建議，對照範例回答修正你的說法。" },
];

const FAQS = [
  {
    q: "需要註冊帳號嗎？",
    a: "不需要。打開練習頁、輸入職缺就能開始。",
  },
  {
    q: "我的回答會被保存嗎？",
    a: "不會。面試內容只存在你目前的瀏覽器分頁中，重新整理頁面就會清除。",
  },
  {
    q: "可以練習哪些職缺？",
    a: "任何職缺都可以，工程、設計、產品、行銷、業務、行政……輸入職缺名稱即可。",
  },
  {
    q: "評分準確嗎？",
    a: "評分由 AI 根據你的回答內容產生，適合作為練習方向的參考，不代表任何企業的實際錄取標準。",
  },
];

export default function Landing() {
  return (
    <main>
      {/* ===== Hero ===== */}
      <section className="paper-dots relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              AI 面試模擬器
            </span>
            <h1 className="mt-6 font-serif text-4xl font-black leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl">
              下一場面試，
              <br />
              先在這裡
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">練過一次</span>
                <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-accent-soft sm:h-4" />
              </span>
              。
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              輸入你想應徵的職缺，AI 面試官會逐題提問、針對回答追問，最後給你評分、改進建議，和每一題更好的回答方式。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/practice"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-white shadow-[0_8px_24px_-8px_rgb(229_80_43/0.6)] transition-colors hover:bg-accent-dark"
              >
                免費開始模擬面試
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#sample"
                className="rounded-full border border-ink/15 px-6 py-3.5 font-medium transition-colors hover:border-ink"
              >
                看評分報告範例
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">免註冊 · {MIN_QUESTIONS}–{MAX_QUESTIONS} 題自訂 · 繁體中文</p>
          </div>

          <HeroMock />
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="功能" title="不只是題庫，而是一位會思考的面試官" />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.tag} className="bg-card p-8 transition-colors hover:bg-paper">
                <span className="font-mono text-sm text-accent">{f.tag}</span>
                <h3 className="mt-3 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how" className="scroll-mt-16 bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="使用流程" title="三個步驟，十分鐘完成一場練習" dark />
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative border-t border-paper/20 pt-6">
                <span className="font-serif text-5xl font-black text-accent">{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-paper/65">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Sample report ===== */}
      <section id="sample" className="scroll-mt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="評分報告" title="知道哪裡不夠好，也知道怎麼說會更好" />
            <p className="mt-5 leading-relaxed text-muted">
              每場面試結束後，你會拿到一份完整報告：0–100 的總分、整體評價、優點與改進方向，以及逐題的分數與回饋。
            </p>
            <p className="mt-3 leading-relaxed text-muted">
              最重要的是「更好的回答方式」：先告訴你答題策略，再示範一段可以照著說的回答。
            </p>
          </div>
          <SampleReport />
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="scroll-mt-16 border-t border-line bg-card">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="常見問題" title="開始之前" center />
          <div className="mt-10 divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-accent px-6 py-16 text-center text-white sm:px-12">
          <h2 className="font-serif text-3xl font-black sm:text-4xl">準備好了嗎？</h2>
          <p className="mx-auto mt-4 max-w-md text-white/85">
            現在就開始一場模擬面試，下一次被問到時，你會知道怎麼回答。
          </p>
          <Link
            href="/practice"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            開始模擬面試 →
          </Link>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  dark,
  center,
}: {
  eyebrow: string;
  title: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <span className="text-sm font-semibold tracking-widest text-accent">{eyebrow}</span>
      <h2
        className={`mt-3 max-w-2xl font-serif text-3xl font-black leading-snug sm:text-4xl ${
          center ? "mx-auto" : ""
        } ${dark ? "text-paper" : ""}`}
      >
        {title}
      </h2>
    </div>
  );
}

// Hero 右側的產品示意畫面（純 HTML 畫出來，不是截圖）
function HeroMock() {
  return (
    <div className="animate-rise relative [animation-delay:150ms]">
      <div className="absolute -inset-4 -z-0 rotate-2 rounded-3xl bg-accent-soft" />
      <div className="relative rounded-2xl border border-line bg-card p-5 shadow-[0_30px_60px_-30px_rgb(26_23_20/0.35)]">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <div className="text-xs text-muted">職缺</div>
            <div className="font-semibold">前端工程師</div>
          </div>
          <span className="rounded-full bg-paper px-3 py-1 font-mono text-xs">2 / 5</span>
        </div>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <Bubble who="ai">請分享一個你優化網頁效能的實際經驗。</Bubble>
          <Bubble who="me">我把商品列表改成虛擬捲動，首屏載入時間從 3.2 秒降到 1.1 秒。</Bubble>
          <Bubble who="ai">很具體！你是怎麼量測並確認瓶頸在列表渲染的？</Bubble>
          <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-sm bg-paper px-3 py-3">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 rounded-xl border border-line bg-card px-4 py-3 shadow-lg sm:-left-8">
        <div className="text-xs text-muted">本題表現</div>
        <div className="font-serif text-2xl font-black">
          8<span className="text-sm font-normal text-muted"> / 10</span>
        </div>
      </div>
    </div>
  );
}

function Bubble({ who, children }: { who: "ai" | "me"; children: React.ReactNode }) {
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
        who === "ai" ? "self-start rounded-bl-sm bg-paper" : "self-end rounded-br-sm bg-ink text-paper"
      }`}
    >
      {children}
    </div>
  );
}

function SampleReport() {
  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-[0_30px_60px_-30px_rgb(26_23_20/0.3)]">
      <div className="flex items-end justify-between border-b border-line pb-5">
        <div>
          <div className="text-xs text-muted">總分</div>
          <div className="font-serif text-6xl font-black leading-none">
            78<span className="text-lg font-normal text-muted"> / 100</span>
          </div>
        </div>
        <span className="rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage">範例報告</span>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-sm font-medium">
          <span>Q2. 你如何決定功能的優先順序？</span>
          <span className="text-muted">5 / 10</span>
        </div>
        <p className="mt-1 text-sm text-muted">提到了要看需求，但缺少具體的評估方法與案例。</p>
        <div className="mt-3 rounded-xl border-l-4 border-sage bg-sage-soft px-4 py-3 text-sm">
          <div className="font-semibold text-sage">更好的回答方式</div>
          <p className="mt-1 leading-relaxed">
            <b>答題策略：</b>先講框架，再舉實例。
            <br />
            <b>範例回答：</b>我會用 RICE 框架評估觸及人數、影響力、信心與成本，例如上一季我們用它把「結帳流程優化」排在首位……
          </p>
        </div>
      </div>
    </div>
  );
}
