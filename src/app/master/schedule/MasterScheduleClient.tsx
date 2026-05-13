"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMasterYearSchedule,
  getMasterMonthSchedule,
  setMasterDaySchedule,
  deleteMasterDaySchedule,
} from "../actions";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  masterId: string;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultWorkDays: string;
}

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface ScheduleDay {
  startTime: string | null;
  endTime: string | null;
  isWorkDay: boolean;
}

export default function MasterScheduleClient({
  masterId,
  defaultStartTime,
  defaultEndTime,
  defaultWorkDays,
}: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [view, setView] = useState<"year" | "month">("year");
  const [month, setMonth] = useState<number | null>(null);
  const [yearSchedule, setYearSchedule] = useState<Record<string, ScheduleDay>>({});
  const [monthSchedule, setMonthSchedule] = useState<Record<string, ScheduleDay>>({});
  const [loading, setLoading] = useState(false);

  // Day modal state
  const [dayModal, setDayModal] = useState<string | null>(null);
  const [dayStart, setDayStart] = useState("");
  const [dayEnd, setDayEnd] = useState("");
  const [dayIsWork, setDayIsWork] = useState(true);
  const [saving, setSaving] = useState(false);

  const workDaysArr = defaultWorkDays.split(",").map((d) => parseInt(d.trim(), 10));

  const loadYear = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMasterYearSchedule(masterId, year);
      setYearSchedule(data);
    } catch {
      toast.error("Ошибка загрузки графика");
    } finally {
      setLoading(false);
    }
  }, [masterId, year]);

  const loadMonth = useCallback(async (m: number) => {
    setLoading(true);
    try {
      const data = await getMasterMonthSchedule(masterId, year, m);
      setMonthSchedule(data);
    } catch {
      toast.error("Ошибка загрузки месяца");
    } finally {
      setLoading(false);
    }
  }, [masterId, year]);

  useEffect(() => {
    if (view === "year") {
      loadYear();
    }
  }, [view, loadYear]);

  useEffect(() => {
    if (view === "month" && month !== null) {
      loadMonth(month);
    }
  }, [view, month, loadMonth]);

  function openMonth(m: number) {
    setMonth(m);
    setView("month");
  }

  function backToYear() {
    setView("year");
    setMonth(null);
  }

  function getDefaultForDate(dateStr: string): ScheduleDay {
    const d = new Date(dateStr + "T00:00:00");
    const dayOfWeek = d.getDay();
    const isWork = workDaysArr.includes(dayOfWeek);
    return {
      startTime: isWork ? defaultStartTime : null,
      endTime: isWork ? defaultEndTime : null,
      isWorkDay: isWork,
    };
  }

  function getDaySchedule(dateStr: string): ScheduleDay {
    return monthSchedule[dateStr] || yearSchedule[dateStr] || getDefaultForDate(dateStr);
  }

  function openDayModal(dateStr: string) {
    const sched = getDaySchedule(dateStr);
    setDayModal(dateStr);
    setDayStart(sched.startTime || defaultStartTime);
    setDayEnd(sched.endTime || defaultEndTime);
    setDayIsWork(sched.isWorkDay);
  }

  async function saveDay() {
    if (!dayModal) return;
    setSaving(true);
    try {
      if (dayIsWork) {
        await setMasterDaySchedule(masterId, dayModal, dayStart, dayEnd, true);
      } else {
        await setMasterDaySchedule(masterId, dayModal, null, null, false);
      }
      toast.success("Сохранено");
      setDayModal(null);
      if (view === "month" && month !== null) {
        loadMonth(month);
      }
      loadYear();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function resetDay() {
    if (!dayModal) return;
    setSaving(true);
    try {
      await deleteMasterDaySchedule(masterId, dayModal);
      toast.success("Сброшено");
      setDayModal(null);
      if (view === "month" && month !== null) {
        loadMonth(month);
      }
      loadYear();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  function hasConfiguredDaysInMonth(m: number): boolean {
    const start = new Date(year, m, 1);
    const end = new Date(year, m + 1, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      if (yearSchedule[key]) return true;
    }
    return false;
  }

  // Year view
  if (view === "year") {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-300 text-slate-900">
            График на {year}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Загрузка...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MONTH_NAMES.map((name, idx) => {
              const hasDot = hasConfiguredDaysInMonth(idx);
              return (
                <button
                  key={idx}
                  onClick={() => openMonth(idx)}
                  className="bg-white border border-slate-200 p-6 text-left hover:border-sky-400 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl font-300 text-slate-900">
                      {name}
                    </span>
                    {hasDot && (
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 uppercase tracking-wider">
                    {idx + 1} месяц
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Month view
  const daysInMonth = month !== null ? new Date(year, month + 1, 0).getDate() : 0;
  const firstDay = month !== null ? new Date(year, month, 1).getDay() : 0;
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={backToYear}
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад к году
        </button>
        <h2 className="font-serif text-2xl font-300 text-slate-900">
          {month !== null ? MONTH_NAMES[month] : ""} {year}
        </h2>
        <div />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Загрузка...</p>
      ) : (
        <div className="bg-white border border-slate-200">
          {/* Week days */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-medium text-slate-400 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: adjustedFirst }).map((_, i) => (
              <div key={`e${i}`} className="aspect-square border-r border-b border-slate-50 bg-slate-50/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month! + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const sched = getDaySchedule(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={day}
                  onClick={() => openDayModal(dateStr)}
                  className={`aspect-square border-r border-b border-slate-100 p-2 flex flex-col items-center justify-start transition-colors hover:bg-slate-50 ${
                    isToday ? "ring-2 ring-inset ring-sky-400" : ""
                  }`}
                >
                  <span className={`text-sm font-medium ${sched.isWorkDay ? "text-slate-900" : "text-slate-400"}`}>
                    {day}
                  </span>
                  {sched.isWorkDay && sched.startTime && (
                    <span className="text-[10px] text-slate-500 mt-1">
                      {sched.startTime}
                    </span>
                  )}
                  {!sched.isWorkDay && (
                    <span className="text-[10px] text-slate-400 mt-1">Вых</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Modal */}
      {dayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white w-full max-w-sm p-6 border border-slate-200 shadow-xl">
            <h3 className="font-serif text-xl font-300 text-slate-900 mb-6">
              {new Date(dayModal + "T00:00:00").toLocaleDateString("ru-RU", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dayIsWork}
                  onChange={(e) => setDayIsWork(e.target.checked)}
                  className="w-4 h-4 border-slate-300 text-sky-400 focus:ring-sky-400"
                />
                Рабочий день
              </label>
            </div>

            {dayIsWork && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Начало
                  </label>
                  <input
                    type="time"
                    value={dayStart}
                    onChange={(e) => setDayStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Окончание
                  </label>
                  <input
                    type="time"
                    value={dayEnd}
                    onChange={(e) => setDayEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={saveDay}
                disabled={saving}
                className="flex-1 py-3 bg-slate-900 text-white text-sm tracking-wide hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={resetDay}
                disabled={saving}
                className="flex-1 py-3 border border-slate-200 text-slate-700 text-sm tracking-wide hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Сбросить
              </button>
              <button
                onClick={() => setDayModal(null)}
                className="flex-1 py-3 border border-slate-200 text-slate-500 text-sm tracking-wide hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
