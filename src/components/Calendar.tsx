"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  onSelectDate: (dateStr: string) => void;
  selectedDate: string | null;
}

const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Calendar({ onSelectDate, selectedDate }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Max date: 2 months from today (e.g. today is May 12 → max is July 12)
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 2);

  // Min navigation: current month
  const minNavDate = new Date(today.getFullYear(), today.getMonth(), 1);
  // Max navigation: month of maxDate
  const maxNavDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  const canGoPrev = currentDate > minNavDate;
  const canGoNext = currentDate < maxNavDate;

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const result: {
      day: number;
      dateStr: string;
      isWeekend: boolean;
      isToday: boolean;
      isPast: boolean;
      isBeyondMax: boolean;
    }[] = [];

    for (let i = 0; i < startDay; i++) {
      result.push({ day: 0, dateStr: "", isWeekend: false, isToday: false, isPast: false, isBeyondMax: false });
    }

    const todayStr = formatDateLocal(today);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = formatDateLocal(date);
      result.push({
        day: d,
        dateStr,
        isWeekend,
        isToday: dateStr === todayStr,
        isPast: date < today,
        isBeyondMax: date > maxDate,
      });
    }

    return result;
  }, [year, month, today, maxDate]);

  const prevMonth = () => {
    if (!canGoPrev) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="rounded-none text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="font-serif text-xl text-slate-900">
          {monthNames[month]} <span className="text-slate-400">{year}</span>
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          disabled={!canGoNext}
          className="rounded-none text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-[10px] uppercase tracking-wider text-slate-400 py-2"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((item, idx) => {
          if (item.day === 0) {
            return <div key={idx} className="aspect-square" />;
          }

          const isSelected = selectedDate === item.dateStr;
          const isDisabled = item.isWeekend || item.isPast || item.isBeyondMax;

          if (isDisabled) {
            return (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center text-sm ${
                  item.isWeekend
                    ? "text-slate-300 bg-slate-50/50"
                    : "text-slate-300 bg-slate-50/30"
                }`}
              >
                {item.day}
              </div>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(item.dateStr)}
              className={`
                aspect-square flex items-center justify-center text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-sky-200 text-slate-900"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }
                ${item.isToday && !isSelected ? "ring-1 ring-sky-300 ring-inset" : ""}
              `}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
