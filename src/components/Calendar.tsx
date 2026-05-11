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
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export default function Calendar({ onSelectDate, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // getDay() returns 0 for Sunday, we want Monday=0 ... Sunday=6
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const result: {
      day: number;
      dateStr: string;
      isWeekend: boolean;
      isToday: boolean;
    }[] = [];

    // Pad start
    for (let i = 0; i < startDay; i++) {
      result.push({ day: 0, dateStr: "", isWeekend: false, isToday: false });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = date.toISOString().split("T")[0];
      result.push({
        day: d,
        dateStr,
        isWeekend,
        isToday: dateStr === todayStr,
      });
    }

    return result;
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isCurrentMonth =
    new Date().getMonth() === month && new Date().getFullYear() === year;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-lg font-semibold text-slate-900">
          {monthNames[month]} {year}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-slate-400 py-2"
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

          if (item.isWeekend) {
            return (
              <div
                key={idx}
                className="aspect-square rounded-xl flex items-center justify-center text-sm text-slate-300 bg-slate-100/50"
              >
                {item.day}
              </div>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(item.dateStr)}
              disabled={!isCurrentMonth && item.dateStr < new Date().toISOString().split("T")[0]}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-sky-400 text-white shadow-md shadow-sky-400/30 scale-105"
                    : "bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-500 shadow-sm"
                }
                ${item.isToday && !isSelected ? "ring-2 ring-sky-400 ring-offset-1" : ""}
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
