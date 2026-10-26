"use client";

import Link from "next/link";
import { useState } from "react";
import { clearApiKey, saveApiKey, useApiKey } from "@/lib/apiKey";

export default function Settings() {
  // 已存在 localStorage 的金鑰（伺服器渲染時是 null，視為空字串）
  const savedKey = useApiKey() ?? "";
  // 使用者正在輸入的內容；null 代表沒動過，直接顯示已存的金鑰
  const [draft, setDraft] = useState<string | null>(null);
  const apiKey = draft ?? savedKey;
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState("");

  function save(e: React.FormEvent) {
    e.preventDefault();
    const key = apiKey.trim();
    if (!key) return;
    if (saveApiKey(key)) {
      setDraft(null);
      setStatus("已儲存，可以開始練習了。");
    } else {
      setStatus("無法寫入瀏覽器儲存空間，請確認沒有使用無痕模式或封鎖網站資料。");
    }
  }

  function clear() {
    clearApiKey();
    setDraft(null);
    setStatus("已清除金鑰。");
  }

  return (
    <main className="paper-dots flex flex-1 justify-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="animate-rise flex w-full max-w-2xl flex-col">
        <div className="text-center">
          <span className="text-sm font-semibold tracking-widest text-accent">設定</span>
          <h1 className="mt-3 font-serif text-3xl font-black sm:text-4xl">你的 OpenAI API 金鑰</h1>
          <p className="mt-3 text-muted">
            本服務採用自備金鑰（BYOK），面試時會用你的金鑰呼叫 OpenAI，費用由你的帳號支付。
          </p>
        </div>

        <form
          onSubmit={save}
          className="mt-10 flex flex-col gap-6 rounded-2xl border border-line bg-card p-6 shadow-[0_30px_60px_-35px_rgb(26_23_20/0.35)] sm:p-8"
        >
          <label className="flex flex-col gap-3">
            <span className="flex items-center justify-between text-sm font-semibold">
              API 金鑰
              <span className={`font-normal ${savedKey ? "text-sage" : "text-muted"}`}>
                {savedKey ? "● 已設定" : "○ 尚未設定"}
              </span>
            </span>
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setStatus("");
                }}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-3.5 font-mono text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="shrink-0 rounded-xl border border-line px-4 text-sm text-muted transition-colors hover:border-ink hover:text-ink"
              >
                {showKey ? "隱藏" : "顯示"}
              </button>
            </div>
            <span className="text-xs text-muted">
              還沒有金鑰？到{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink"
              >
                OpenAI 平台
              </a>{" "}
              建立一組。
            </span>
          </label>

          {status && <p className="text-sm text-accent-dark">{status}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!apiKey.trim() || apiKey.trim() === savedKey}
              className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-ink"
            >
              儲存
            </button>
            {savedKey && (
              <button
                type="button"
                onClick={clear}
                className="rounded-full border border-line px-6 py-3 font-medium transition-colors hover:border-accent hover:text-accent"
              >
                清除金鑰
              </button>
            )}
            {savedKey && (
              <Link
                href="/practice"
                className="ml-auto rounded-full bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-dark"
              >
                開始練習 →
              </Link>
            )}
          </div>

          <ul className="space-y-1.5 border-t border-line pt-5 text-xs leading-relaxed text-muted">
            <li>· 金鑰只儲存在這個瀏覽器的 localStorage，不會存到我們的伺服器或資料庫。</li>
            <li>· 每次面試請求時會附在 header 送到本站伺服器，由伺服器轉呼叫 OpenAI，用完即丟。</li>
            <li>· 在公用電腦使用後，記得按「清除金鑰」。</li>
          </ul>
        </form>
      </div>
    </main>
  );
}
