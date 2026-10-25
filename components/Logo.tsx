import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      {/* 對話框造型的標誌 */}
      <span className="relative grid h-8 w-8 place-items-center rounded-lg rounded-bl-none bg-ink text-sm font-bold text-paper">
        AI
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-paper" />
      </span>
      <span className="text-lg font-semibold tracking-tight">
        AI Interview
      </span>
    </Link>
  );
}
