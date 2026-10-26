// 使用者自備的 OpenAI API 金鑰（BYOK），只存在使用者自己的瀏覽器 localStorage。
// 只能在瀏覽器端呼叫；localStorage 在無痕模式或被封鎖時可能會丟錯，所以都包在 try/catch 裡。

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ai-interview:openai-api-key";

// 同一個分頁內存/清金鑰時，通知正在使用 useApiKey 的元件重新讀取
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((listener) => listener());
}

export function loadApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveApiKey(key: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, key);
    notify();
    return true;
  } catch {
    return false;
  }
}

export function clearApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 無法存取 localStorage 時，本來就沒有存任何東西
  }
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 其他分頁修改 localStorage 時也會收到 storage 事件
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// 讀取目前存的金鑰；伺服器渲染時拿不到 localStorage，回傳 null 代表「還不知道」
export function useApiKey(): string | null {
  return useSyncExternalStore(subscribe, loadApiKey, () => null);
}
