"use client";

import { useState } from "react";
import { reviews } from "@/lib/data";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReviewsAccordionProps {
  open?: boolean;
  onToggle?: () => void;
}

export default function ReviewsAccordion({ open, onToggle }: ReviewsAccordionProps) {
  const isControlled = open !== undefined && onToggle !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;
  const toggle = isControlled ? onToggle : () => setInternalOpen(!internalOpen);

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", text: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", text: "" });
    }, 2000);
  };

  return (
    <div>
      {/* Если не controlled — показываем свой заголовок (для страниц мастеров и т.д.) */}
      {!isControlled && (
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between py-5 text-left group border-t border-slate-200"
        >
          <span className="font-serif text-xl text-slate-900">Отзывы</span>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? "max-h-[1200px] opacity-100 pb-8" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-6 pt-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/5 border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 flex items-center justify-center text-white/60 text-sm font-serif">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {review.name}
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(review.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h4 className="font-serif text-lg text-white mb-4">
            Оставить отзыв
          </h4>
          {submitted ? (
            <div className="py-6 text-center">
              <div className="w-10 h-10 border border-sky-300 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-sky-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white text-sm">Спасибо за отзыв!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ваше имя"
                className="rounded-none bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-sky-300 focus:ring-sky-200"
              />
              <textarea
                required
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Ваш отзыв..."
                rows={4}
                className="w-full rounded-none bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-200 transition-colors resize-none"
              />
              <Button
                type="submit"
                className="rounded-none bg-white text-slate-900 hover:bg-sky-50 transition-colors w-full sm:w-auto self-start"
              >
                <Send className="w-4 h-4 mr-2" />
                Отправить
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
