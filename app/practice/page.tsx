"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_QUESTIONS,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type ChatMessage,
  type Evaluation,
  type InterviewResponse,
} from "@/lib/interview";

type Stage = "setup" | "interview" | "result";

const QUESTION_OPTIONS = Array.from(
  { length: MAX_QUESTIONS - MIN_QUESTIONS + 1 },
  (_, i) => MIN_QUESTIONS + i,
);
const JOB_SUGGESTIONS = ["前端工程師", "產品經理", "UI/UX 設計師", "資料分析師", "行銷企劃"];

export default function Practice() {
  const [stage, setStage] = useState<Stage>("setup");
  const [jobTitle, setJobTitle] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  async function callInterview(history: ChatMessage[]) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, totalQuestions, messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");

      const result = data as InterviewResponse;
      if (result.done) {
        setEvaluation(result.evaluation);
        setStage("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMessages([...history, { role: "assistant", content: result.reply }]);
        setQuestionNumber(result.questionNumber);
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function startInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    setStage("interview");
    await callInterview([]);
  }

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    const content = answer.trim();
    if (!content || loading) return;
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(history);
    setAnswer("");
    if (!(await callInterview(history))) {
      // 失敗時還原，讓使用者可以重送
      setMessages(messages);
      setAnswer(content);
    }
  }

  function restart() {
    setStage("setup");
    setMessages([]);
    setQuestionNumber(0);
    setAnswer("");
    setEvaluation(null);
    setError("");
  }

  const answered = messages.filter((m) => m.role === "user").length;

  return (
    <main className="paper-dots flex flex-1 justify-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent-dark">
            <span>{error}</span>
            {stage === "interview" && messages.length === 0 && !loading && (
              <button onClick={() => callInterview([])} className="font-medium underline">
                重試
              </button>
            )}
          </div>
        )}

        {stage === "setup" && (
          <div className="animate-rise">
            <div className="text-center">
              <span className="text-sm font-semibold tracking-widest text-accent">模擬面試</span>
              <h1 className="mt-3 font-serif text-3xl font-black sm:text-4xl">今天想練習哪個職缺？</h1>
              <p className="mt-3 text-muted">選好題數，面試官就會開始提問。</p>
            </div>

            <form
              onSubmit={startInterview}
              className="mt-10 flex flex-col gap-8 rounded-2xl border border-line bg-card p-6 shadow-[0_30px_60px_-35px_rgb(26_23_20/0.35)] sm:p-8"
            >
              <label className="flex flex-col gap-3">
                <span className="text-sm font-semibold">應徵職缺</span>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  maxLength={100}
                  placeholder="輸入職缺名稱"
                  className="rounded-xl border border-line bg-paper px-4 py-3.5 text-lg outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
                />
                <div className="flex flex-wrap gap-2">
                  {JOB_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setJobTitle(s)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        jobTitle === s
                          ? "border-ink bg-ink text-paper"
                          : "border-line text-muted hover:border-ink hover:text-ink"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </label>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 text-sm font-semibold">
                  題數 <span className="font-normal text-muted">· {totalQuestions} 題</span>
                </legend>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {QUESTION_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTotalQuestions(n)}
                      aria-pressed={totalQuestions === n}
                      className={`rounded-lg border py-2.5 font-mono text-sm transition-colors ${
                        totalQuestions === n
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-paper hover:border-ink"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={!jobTitle.trim()}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 font-medium text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-ink"
              >
                開始面試
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </form>
          </div>
        )}

        {stage === "interview" && (
          <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_30px_60px_-35px_rgb(26_23_20/0.35)]">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="text-xs text-muted">職缺</div>
                <div className="truncate font-semibold">{jobTitle}</div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden gap-1 sm:flex">
                  {QUESTION_OPTIONS.slice(0, totalQuestions).map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 w-5 rounded-full transition-colors ${
                        n <= answered ? "bg-ink" : n === questionNumber ? "bg-accent" : "bg-line"
                      }`}
                    />
                  ))}
                </div>
                <span className="rounded-full bg-paper px-3 py-1 font-mono text-xs">
                  {Math.min(questionNumber, totalQuestions)} / {totalQuestions}
                </span>
              </div>
            </div>

            <div className="flex min-h-[360px] flex-col gap-4 px-5 py-6 sm:px-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`animate-rise flex max-w-[85%] flex-col gap-1 ${
                    m.role === "assistant" ? "self-start" : "items-end self-end"
                  }`}
                >
                  <span className="text-xs text-muted">{m.role === "assistant" ? "面試官" : "你"}</span>
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-4 py-3 leading-relaxed ${
                      m.role === "assistant"
                        ? "rounded-tl-sm bg-paper"
                        : "rounded-tr-sm bg-ink text-paper"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex flex-col gap-1 self-start">
                  <span className="text-xs text-muted">
                    {answered >= totalQuestions ? "面試官正在撰寫評分報告" : "面試官思考中"}
                  </span>
                  <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-sm bg-paper px-3 py-3.5">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={submitAnswer} className="border-t border-line bg-paper/60 p-4 sm:p-5">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitAnswer(e);
                }}
                disabled={loading || messages.length === 0}
                maxLength={2000}
                rows={4}
                placeholder="輸入你的回答……"
                className="w-full resize-none rounded-xl border border-line bg-card px-4 py-3 leading-relaxed outline-none transition-colors placeholder:text-muted/60 focus:border-ink disabled:opacity-50"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-muted">
                  Ctrl + Enter 送出 · {answer.length} / 2000
                </span>
                <button
                  type="submit"
                  disabled={loading || !answer.trim()}
                  className="rounded-full bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-30"
                >
                  送出回答
                </button>
              </div>
            </form>
          </section>
        )}

        {stage === "result" && evaluation && <Report evaluation={evaluation} jobTitle={jobTitle} onRestart={restart} />}
      </div>
    </main>
  );
}

function Report({
  evaluation,
  jobTitle,
  onRestart,
}: {
  evaluation: Evaluation;
  jobTitle: string;
  onRestart: () => void;
}) {
  return (
    <section className="animate-rise flex flex-col gap-5">
      <div className="overflow-hidden rounded-2xl bg-ink text-paper">
        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
          <div>
            <div className="text-xs text-paper/60">總分</div>
            <div className="font-serif text-7xl font-black leading-none">
              {evaluation.score}
              <span className="text-xl font-normal text-paper/50"> / 100</span>
            </div>
          </div>
          <div className="sm:border-l sm:border-paper/15 sm:pl-6">
            <div className="text-xs text-paper/60">職缺 · {jobTitle}</div>
            <p className="mt-2 leading-relaxed text-paper/90">{evaluation.summary}</p>
          </div>
        </div>
        <div className="h-1.5 bg-paper/10">
          <div className="h-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, evaluation.score))}%` }} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ListCard title="優點" items={evaluation.strengths} tone="sage" />
        <ListCard title="改進方向" items={evaluation.improvements} tone="accent" />
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-black">逐題回饋</h2>
        <ol className="mt-6 flex flex-col gap-8">
          {evaluation.perQuestion?.map((q, i) => (
            <li key={i} className="border-t border-line pt-6 first:border-0 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="font-mono text-sm text-accent">Q{i + 1}</span>
                  <span className="font-semibold leading-snug">{q.question}</span>
                </div>
                <span className="shrink-0 rounded-full bg-paper px-3 py-1 font-mono text-sm">
                  {q.score} / 10
                </span>
              </div>
              <p className="mt-2 pl-8 leading-relaxed text-muted">{q.feedback}</p>
              {q.betterAnswer && (
                <div className="ml-8 mt-4 rounded-xl border-l-4 border-sage bg-sage-soft px-4 py-3">
                  <div className="text-sm font-semibold text-sage">更好的回答方式</div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{q.betterAnswer}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      <button
        onClick={onRestart}
        className="self-center rounded-full bg-ink px-8 py-3.5 font-medium text-paper transition-colors hover:bg-accent"
      >
        再練習一次
      </button>
    </section>
  );
}

function ListCard({ title, items, tone }: { title: string; items?: string[]; tone: "sage" | "accent" }) {
  const dot = tone === "sage" ? "bg-sage" : "bg-accent";
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed">
        {items?.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
