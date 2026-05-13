"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleSlotStatus, logoutMaster } from "../actions";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";

interface Slot {
  id: string;
  date: string;
  time: string;
  status: string;
  clientName: string | null;
  clientPhone: string | null;
}

interface Props {
  masterId: string;
  slots: Slot[];
  year: number;
  month: number;
}

const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export default function MasterSlotsClient({ slots, year, month }: Props) {
  const router = useRouter();
  const [localSlots, setLocalSlots] = useState<Slot[]>(slots);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const slotsByDay: Record<number, Slot[]> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    slotsByDay[d] = localSlots.filter((s) => s.date === dateStr);
  }

  async function handleToggle(slot: Slot) {
    if (slot.status === "booked") {
      toast.error("Нельзя изменить занятый слот");
      return;
    }

    const newStatus = slot.status === "free" ? "blocked" : "free";
    try {
      await toggleSlotStatus(slot.id, newStatus);
      setLocalSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, status: newStatus } : s))
      );
      toast.success(newStatus === "blocked" ? "Слот закрыт" : "Слот открыт");
    } catch {
      toast.error("Ошибка при изменении слота");
    }
  }

  function navigateMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    router.push(`/master/slots?year=${newYear}&month=${newMonth}`);
  }

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-300 text-slate-900">
            BeautyBook
          </Link>
          <form action={logoutMaster}>
            <button
              type="submit"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Выйти
            </button>
          </form>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 flex gap-6">
          <Link
            href="/master/dashboard"
            className="py-3 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Записи
          </Link>
          <Link
            href="/master/schedule"
            className="py-3 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            График
          </Link>
          <Link
            href="/master/slots"
            className="py-3 text-sm text-slate-900 border-b-2 border-slate-900"
          >
            Слоты
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-300 text-slate-900 mb-6">
          Управление слотами
        </h1>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-serif text-xl font-300 text-slate-900">
            {monthNames[month - 1]} {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-white border border-slate-100">
          {/* Week days header */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekDays.map((d) => (
              <div key={d} className="py-2 text-center text-xs text-slate-500 border-r border-slate-50 last:border-r-0">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: adjustedFirstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] border-r border-b border-slate-50 bg-slate-50/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
              const day = dayIndex + 1;
              const daySlots = slotsByDay[day] || [];
              const hasBooked = daySlots.some((s) => s.status === "booked");
              return (
                <div
                  key={day}
                  className="min-h-[120px] border-r border-b border-slate-100 p-2 last:border-r-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{day}</span>
                    {hasBooked && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>

                  <div className="space-y-1 max-h-[80px] overflow-y-auto">
                    {daySlots.slice(0, 4).map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between text-xs px-1.5 py-0.5 ${
                          slot.status === "booked"
                            ? "bg-emerald-50 text-emerald-700"
                            : slot.status === "blocked"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        <span className="truncate">{slot.time}</span>
                        {slot.status !== "booked" && (
                          <button
                            onClick={() => handleToggle(slot)}
                            className="ml-1 hover:opacity-70 transition-opacity"
                            title={slot.status === "free" ? "Закрыть" : "Открыть"}
                          >
                            {slot.status === "free" ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <Unlock className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                    {daySlots.length > 4 && (
                      <p className="text-xs text-slate-400 px-1.5">
                        +{daySlots.length - 4} слотов
                      </p>
                    )}
                    {daySlots.length === 0 && (
                      <p className="text-xs text-slate-300 px-1.5">Нет слотов</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-50 border border-sky-200" />
            Свободно
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-50 border border-emerald-200" />
            Занято
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-slate-100 border border-slate-200" />
            Закрыто
          </div>
        </div>
      </main>
    </div>
  );
}
