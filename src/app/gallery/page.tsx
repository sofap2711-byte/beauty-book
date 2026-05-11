"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { ArrowLeft, X } from "lucide-react";

const galleryItems = [
  { id: 1, label: "Стрижка", span: "row-span-2" },
  { id: 2, label: "Окрашивание", span: "" },
  { id: 3, label: "Укладка", span: "" },
  { id: 4, label: "Маникюр", span: "row-span-2" },
  { id: 5, label: "Уход", span: "" },
  { id: 6, label: "Косметология", span: "" },
];

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <Link
          href="/"
          className="inline-flex items-center text-slate-400 hover:text-slate-700 transition-colors mb-10 text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Link>

        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">
            Работы
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-slate-900 font-300">
            Галерея
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl">
            Примеры наших работ — от естественных укладок до сложных окрашиваний
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px]">
          {galleryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setLightbox(item.id)}
              className={`relative bg-slate-200 overflow-hidden group ${item.span} hover:shadow-xl transition-shadow duration-500`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-xl text-slate-400 italic">
                  {item.label}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="bg-slate-200 w-full max-w-3xl aspect-[4/3] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-serif text-2xl text-slate-400 italic">
              {galleryItems.find((i) => i.id === lightbox)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
