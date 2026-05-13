"use client";

import { useParams, notFound } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { getMasterById, getMasterTimeBlocks } from "@/app/actions";
import Nav from "@/components/Nav";
import Calendar from "@/components/Calendar";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Master } from "@prisma/client";

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
}

export default function BookPage() {
  const params = useParams();
  const masterId = params.id as string;

  const [master, setMaster] = useState<Master | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocksLoading, setBlocksLoading] = useState(false);

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

  const loadBlocks = useCallback(
    (date: string) => {
      setBlocksLoading(true);
      getMasterTimeBlocks(masterId, date).then((data) => {
        setBlocks(data);
        setBlocksLoading(false);
      });
    },
    [masterId]
  );

  useEffect(() => {
    if (selectedDate) {
      loadBlocks(selectedDate);
    }
  }, [selectedDate, loadBlocks]);

  const slots = useMemo(() => {
    if (!master) return [];
    const startMin = parseInt(master.startTime.split(":")[0]) * 60 + parseInt(master.startTime.split(":")[1]);
    const endMin = parseInt(master.endTime.split(":")[0]) * 60 + parseInt(master.endTime.split(":")[1]);

    const occupied = blocks
      .filter((b) => b.status !== "cancelled")
      .map((b) => ({
        start: parseInt(b.startTime.split(":")[0]) * 60 + parseInt(b.startTime.split(":")[1]),
        end: parseInt(b.endTime.split(":")[0]) * 60 + parseInt(b.endTime.split(":")[1]),
      }))
      .sort((a, b) => a.start - b.start);

    const result: { time: string; duration: number }[] = [];
    let current = startMin;

    for (const occ of occupied) {
      while (current + 30 <= occ.start && current + 30 <= endMin) {
        const h = Math.floor(current / 60).toString().padStart(2, "0");
        const m = (current % 60).toString().padStart(2, "0");
        result.push({ time: `${h}:${m}`, duration: 30 });
        current += 30;
      }
      current = Math.max(current, occ.end);
    }

    while (current + 30 <= endMin) {
      const h = Math.floor(current / 60).toString().padStart(2, "0");
      const m = (current % 60).toString().padStart(2, "0");
      result.push({ time: `${h}:${m}`, duration: 30 });
      current += 30;
    }

    return result;
  }, [blocks, master]);

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
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })}
            </h2>

            {blocksLoading ? (
              <p className="text-sm text-slate-400">Загрузка...</p>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {slots.map((slot) => (
                  <BookingDialog
                    key={slot.time}
                    masterId={masterId}
                    date={selectedDate}
                    time={slot.time}
                    duration={slot.duration}
                    masterName={master.name}
                    onSuccess={() => loadBlocks(selectedDate)}
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full rounded-none border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm py-5"
                      >
                        {slot.time}
                      </Button>
                    }
                  />
                ))}
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
