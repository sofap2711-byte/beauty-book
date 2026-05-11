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
      <DialogContent className="rounded-2xl bg-white border-0 shadow-2xl max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg">
            Запись на приём
          </DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-sky-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-slate-900 font-semibold">Запись успешна!</p>
            <p className="text-slate-500 text-sm mt-1">(Демо-режим)</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
              <p>
                <span className="font-medium text-slate-700">Мастер:</span>{" "}
                {masterName}
              </p>
              <p>
                <span className="font-medium text-slate-700">Дата:</span>{" "}
                {date}
              </p>
              <p>
                <span className="font-medium text-slate-700">Время:</span>{" "}
                {time}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Имя
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ваше имя"
                className="rounded-xl border-slate-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Телефон
              </label>
              <Input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+7 (999) 000-00-00"
                className="rounded-xl border-slate-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Telegram
              </label>
              <Input
                value={form.telegram}
                onChange={(e) =>
                  setForm({ ...form, telegram: e.target.value })
                }
                placeholder="@ник"
                className="rounded-xl border-slate-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Комментарий
              </label>
              <textarea
                value={form.comment}
                onChange={(e) =>
                  setForm({ ...form, comment: e.target.value })
                }
                placeholder="Особые пожелания..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors resize-none"
              />
            </div>
            <Button
              type="submit"
              className="rounded-full bg-sky-400 hover:bg-sky-500 text-white shadow-md shadow-sky-400/20 transition-all hover:scale-105 active:scale-95 mt-1"
            >
              Подтвердить запись
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
