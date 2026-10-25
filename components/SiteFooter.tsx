import Link from "next/link";
import Logo from "@/components/Logo";

const COLUMNS = [
  {
    title: "產品",
    links: [
      { href: "/practice", label: "開始模擬面試" },
      { href: "/#features", label: "功能介紹" },
      { href: "/#how", label: "使用流程" },
    ],
  },
  {
    title: "資源",
    links: [
      { href: "/#faq", label: "常見問題" },
      { href: "/#sample", label: "評分報告範例" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            用 AI 面試官反覆演練，帶著評分、建議與範例回答，走進下一場真正的面試。
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
          <span>© AI Interview</span>
          <span>AI 產生的內容僅供練習參考</span>
        </div>
      </div>
    </footer>
  );
}
