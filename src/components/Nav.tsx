"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#about", label: "О салоне" },
    { href: "#services", label: "Услуги" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9fa]/80 backdrop-blur-md border-b border-slate-200/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-300 tracking-wide text-slate-900">
          BeautyBook <span className="italic text-slate-500 text-base ml-1">Aesthetics</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/#services"
            className="text-sm px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors tracking-wide"
          >
            Записаться
          </Link>
        </div>

        <button
          className="md:hidden text-slate-700"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#f8f9fa] border-t border-slate-200/40 px-6 py-6 flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base text-slate-700 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/#services"
            onClick={() => setOpen(false)}
            className="text-base px-5 py-3 bg-slate-900 text-white text-center hover:bg-slate-800 transition-colors"
          >
            Записаться
          </Link>
        </div>
      )}
    </nav>
  );
}
