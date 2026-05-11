"use client";

import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-slate-400 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            BeautyBook
          </span>
        </Link>
        <Button
          variant="outline"
          className="rounded-full border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Войти
        </Button>
      </div>
    </header>
  );
}
