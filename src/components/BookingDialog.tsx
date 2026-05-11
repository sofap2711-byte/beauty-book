"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BookingDialogProps {
  trigger: React.ReactNode;
  date: string;
  time: string;
  masterName: string;
}

export default function BookingDialog({
  trigger,
  date,
  time,
  masterName,
}: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "+7",
    telegram: "",
    comment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setForm({ name: "", phone: "+7", telegram: "", comment: "" });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-none bg-white border border-slate-200 shadow-2xl max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="font-serif text-slate-900 text-2xl font-300">
            Запись на приём
          </DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 border border-sky-300 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-sky-400"
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
            <p className="font-serif text-xl text-slate-900">Запись успешна!</p>
            <p className="text-slate-400 text-sm mt-1">(Демо-режим)</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
            <div className="text-sm text-slate-500 bg-slate-50 border border-slate-100 px-4 py-3">
              <p>
                <span className="text-slate-700">Мастер:</span> {masterName}
              </p>
              <p>
                <span className="text-slate-700">Дата:</span> {date}
              </p>
              <p>
                <span className="text-slate-700">Время:</span> {time}
              </p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 mb-2 block">
                Имя
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ваше имя"
                className="rounded-none border-slate-200 focus:border-sky-300 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 mb-2 block">
                Телефон
              </label>
              <Input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+7 (999) 000-00-00"
                className="rounded-none border-slate-200 focus:border-sky-300 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 mb-2 block">
                Telegram
              </label>
              <Input
                value={form.telegram}
                onChange={(e) =>
                  setForm({ ...form, telegram: e.target.value })
                }
                placeholder="@ник"
                className="rounded-none border-slate-200 focus:border-sky-300 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 mb-2 block">
                Комментарий
              </label>
              <textarea
                value={form.comment}
                onChange={(e) =>
                  setForm({ ...form, comment: e.target.value })
                }
                placeholder="Особые пожелания..."
                rows={3}
                className="w-full rounded-none border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-200 transition-colors resize-none"
              />
            </div>
            <Button
              type="submit"
              className="rounded-none bg-slate-900 hover:bg-slate-800 text-white transition-colors mt-1"
            >
              Подтвердить запись
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
