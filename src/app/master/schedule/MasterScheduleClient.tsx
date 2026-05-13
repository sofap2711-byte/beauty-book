"use client";

import { useState } from "react";
import Link from "next/link";
import { updateMasterSchedule, generateSlotsForMaster } from "../actions";
import { logoutMaster } from "../actions";
import { toast } from "sonner";

interface Props {
  masterId: string;
  initialData: {
    workDays: string;
    startTime: string;
    endTime: string;
    breakStart: string | null;
    breakEnd: string | null;
  };
}

const daysOfWeek = [
  { key: 1, label: "Пн" },
  { key: 2, label: "Вт" },
  { key: 3, label: "Ср" },
  { key: 4, label: "Чт" },
  { key: 5, label: "Пт" },
  { key: 6, label: "Сб" },
  { key: 0, label: "Вс" },
];

export default function MasterScheduleClient({ masterId, initialData }: Props) {
  const [workDays, setWorkDays] = useState<string[]>(
    initialData.workDays.split(",").map((d) => d.trim())
  );
  const [startTime, setStartTime] = useState(initialData.startTime);
  const [endTime, setEndTime] = useState(initialData.endTime);
  const [breakStart, setBreakStart] = useState(initialData.breakStart || "");
  const [breakEnd, setBreakEnd] = useState(initialData.breakEnd || "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  function toggleDay(day: string) {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function validate(): string | null {
    if (workDays.length === 0) return "Выберите хотя бы один рабочий день";

    const start = parseInt(startTime.replace(":", ""), 10);
    const end = parseInt(endTime.replace(":", ""), 10);
    if (start >= end) return "Время начала должно быть меньше времени окончания";

    const startMinAllowed = parseInt("07:00".replace(":", ""), 10);
    const endMaxAllowed = parseInt("22:00".replace(":", ""), 10);
    if (start < startMinAllowed) return "Начало работы не раньше 07:00";
    if (end > endMaxAllowed) return "Окончание работы не позже 22:00";

    if (breakStart && breakEnd) {
      const bs = parseInt(breakStart.replace(":", ""), 10);
      const be = parseInt(breakEnd.replace(":", ""), 10);
      if (bs < start || be > end) return "Перерыв должен быть внутри рабочего времени";
      if (bs >= be) return "Начало перерыва должно быть раньше конца";
    }

    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      await updateMasterSchedule(masterId, {
        workDays: workDays.join(","),
        startTime,
        endTime,
        breakStart: breakStart || undefined,
        breakEnd: breakEnd || undefined,
      });
      toast.success("График сохранён");
    } catch {
      toast.error("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setGenerating(true);
    try {
      const result = await generateSlotsForMaster(masterId);
      toast.success(`Сгенерировано ${result.created} слотов`);
    } catch {
      toast.error("Ошибка при генерации слотов");
    } finally {
      setGenerating(false);
    }
  }

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
            className="py-3 text-sm text-slate-900 border-b-2 border-slate-900"
          >
            График
          </Link>
          <Link
            href="/master/slots"
            className="py-3 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Слоты
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-300 text-slate-900 mb-8">
          Управление графиком
        </h1>

        <div className="bg-white border border-slate-100 p-6 md:p-8 max-w-2xl">
          {/* Work Days */}
          <div className="mb-8">
            <label className="block text-sm text-slate-600 mb-3">Рабочие дни</label>
            <div className="flex gap-2 flex-wrap">
              {daysOfWeek.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(String(day.key))}
                  className={`w-12 h-12 text-sm border transition-colors ${
                    workDays.includes(String(day.key))
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm text-slate-600 mb-2">Начало работы</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min="07:00"
                max="22:00"
                className="w-full px-4 py-3 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Окончание работы</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min="07:00"
                max="22:00"
                className="w-full px-4 py-3 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Break */}
          <div className="mb-8">
            <label className="block text-sm text-slate-600 mb-2">Перерыв (опционально)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">С</label>
                <input
                  type="time"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">До</label>
                <input
                  type="time"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-slate-900 text-white text-sm tracking-wide hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить график"}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-3 border border-slate-300 text-slate-700 text-sm tracking-wide hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-50"
            >
              {generating ? "Генерация..." : "Сгенерировать слоты на 1 месяц"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
