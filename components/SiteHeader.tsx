import Link from "next/link";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/#features", label: "功能" },
  { href: "/#how", label: "使用流程" },
  { href: "/#faq", label: "常見問題" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/practice"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent"
        >
          開始練習
        </Link>
      </div>
    </header>
  );
}
