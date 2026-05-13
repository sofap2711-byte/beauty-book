"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutMaster } from "../actions";

interface Props {
  masterName: string;
  children: React.ReactNode;
}

const navItems = [
  { href: "/master/dashboard", label: "Записи" },
  { href: "/master/schedule", label: "График" },
  { href: "/master/diary", label: "Дневник" },
];

export default function MasterLayout({ masterName, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/40 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg font-300 tracking-wide text-slate-900"
          >
            BeautyBook
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">
              {masterName}
            </span>
            <form action={logoutMaster}>
              <button
                type="submit"
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/40 sticky top-14 z-20">
        <div className="max-w-5xl mx-auto px-4 flex gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 text-sm transition-colors border-b-2 ${
                  isActive
                    ? "text-slate-900 border-sky-400"
                    : "text-slate-500 border-transparent hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
