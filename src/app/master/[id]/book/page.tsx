"use client";

import { useParams, notFound } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";
import { getMasterById, getSlotsForDate } from "@/lib/data";
import Header from "@/components/Header";
import Calendar from "@/components/Calendar";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BookPage() {
  const params = useParams();
  const masterId = params.id as string;
  const master = getMasterById(masterId);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return getSlotsForDate(selectedDate);
  }, [selectedDate]);

  if (!master) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        <Link
          href={`/service/${master.serviceId}`}
          className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Назад к мастерам
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
          Выберите дату
        </h1>
        <p className="text-slate-500 mb-8">
          Мастер: <span className="font-medium text-slate-700">{master.name}</span>
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
          <Calendar
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {selectedDate && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Доступное время —{" "}
              {new Date(selectedDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })}
            </h2>

            {slots.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {slots.map((slot) => {
                  if (slot.booked) {
                    return (
                      <div
                        key={slot.time}
                        className="flex flex-col items-center justify-center rounded-xl bg-slate-300 py-3 px-2 opacity-70"
                      >
                        <span className="text-sm font-medium text-slate-500 line-through">
                          {slot.time}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          занято
                        </span>
                      </div>
                    );
                  }

                  return (
                    <BookingDialog
                      key={slot.time}
                      date={selectedDate}
                      time={slot.time}
                      masterName={master.name}
                      trigger={
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200 transition-all hover:scale-105 active:scale-95 py-5"
                        >
                          {slot.time}
                        </Button>
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
