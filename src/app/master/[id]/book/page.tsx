"use client";

import { useParams, notFound } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getMasterById, getMasterSlots } from "@/app/actions";
import Nav from "@/components/Nav";
import Calendar from "@/components/Calendar";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Master, Slot } from "@prisma/client";

export default function BookPage() {
  const params = useParams();
  const masterId = params.id as string;

  const [master, setMaster] = useState<Master | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    getMasterById(masterId)
      .then((m) => {
        setMaster(m);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load master:", err);
        setLoading(false);
      });
  }, [masterId]);

  const loadSlots = useCallback(
    (date: string) => {
      setSlotsLoading(true);
      getMasterSlots(masterId, date).then((data) => {
        setSlots(data);
        setSlotsLoading(false);
      });
    },
    [masterId]
  );

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate, loadSlots]);

  if (!loading && !master) {
    notFound();
  }

  if (loading || !master) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <Nav />
        <main className="max-w-3xl mx-auto px-6 pt-28 pb-20 text-center text-slate-400 text-sm">
          Загрузка...
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Nav />

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link
          href={`/service/${master.serviceId}`}
          className="inline-flex items-center text-slate-400 hover:text-slate-700 transition-colors mb-10 text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к мастерам
        </Link>

        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">
            Запись
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-slate-900 font-300">
            Выберите дату
          </h1>
          <p className="text-slate-500 mt-3">
            Мастер: <span className="text-slate-900">{master.name}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-6 md:p-8 mb-12">
          <Calendar onSelectDate={setSelectedDate} selectedDate={selectedDate} />
        </div>

        {selectedDate && (
          <div className="animate-fade-in-up">
            <h2 className="font-serif text-2xl text-slate-900 mb-6">
              {new Date(selectedDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })}
            </h2>

            {slotsLoading ? (
              <p className="text-sm text-slate-400">Загрузка слотов...</p>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {slots.map((slot) => {
                  if (slot.status === "booked") {
                    return (
                      <div
                        key={slot.id}
                        className="flex flex-col items-center justify-center border border-slate-200 bg-slate-100 py-3 px-2"
                      >
                        <span className="text-sm font-medium text-slate-400 line-through">
                          {slot.time}
                        </span>
                        <span className="text-[10px] text-slate-300 mt-0.5 uppercase tracking-wider">
                          занято
                        </span>
                      </div>
                    );
                  }

                  return (
                    <BookingDialog
                      key={slot.id}
                      slotId={slot.id}
                      date={selectedDate}
                      time={slot.time}
                      masterName={master.name}
                      onSuccess={() => loadSlots(selectedDate)}
                      trigger={
                        <Button
                          variant="outline"
                          className="w-full rounded-none border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm py-5"
                        >
                          {slot.time}
                        </Button>
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Нет доступных слотов на эту дату</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
