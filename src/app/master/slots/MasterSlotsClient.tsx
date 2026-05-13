"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  generateSlotsForDay,
  getMasterSlotsForDay,
  toggleSlotStatus,
  closeAllFreeSlots,
  openAllBlockedSlots,
  deleteSlotsForDay,
  logoutMaster,
} from "../actions";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Lock, Unlock } from "lucide-react";

interface DayStats {
  date: string;
  total: number;
  booked: number;
  blocked: number;
  free: number;
  interval: number;
}

interface SlotWithBooking {
  id: string;
  date: string;
  time: string;
  interval: number;
  status: string;
  clientName: string | null;
  clientPhone: string | null;
  clientTg: string | null;
  comment: string | null;
  booking: {
    id: string;
    clientName: string;
    clientPhone: string;
    clientTg: string | null;
    comment: string | null;
    status: string;
  } | null;
}

interface Props {
  masterId: string;
  workDays: string;
  startTime: string;
  endTime: string;
  slotsByDate: DayStats[];
  year: number;
  month: number;
}

const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const weekDayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const weekDayNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

const INTERVALS = [15, 30, 45, 60, 90, 120];

export default function MasterSlotsClient({
  masterId,
  workDays,
  startTime,
  endTime,
  slotsByDate,
  year,
  month,
}: Props) {
  const router = useRouter();
  const workDaysArr = workDays.split(",").map((d) => parseInt(d.trim(), 10));

  const [modalOpen, setModalOpen] = useState<"create" | "manage" | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState(30);
  const [daySlots, setDaySlots] = useState<SlotWithBooking[]>([]);
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const statsMap: Record<string, DayStats> = {};
  for (const s of slotsByDate) {
    statsMap[s.date] = s;
  }

  function navigateMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    else if (newMonth < 1) { newMonth = 12; newYear--; }
    router.push(`/master/slots?year=${newYear}&month=${newMonth}`);
  }

  function isPast(dateStr: string) {
    return dateStr < todayStr;
  }

  function isWorkDay(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return workDaysArr.includes(d.getDay());
  }

  function getDayClass(dateStr: string, stats?: DayStats): string {
    if (isPast(dateStr)) return "bg-slate-100 text-slate-400 cursor-not-allowed";
    if (!isWorkDay(dateStr)) return "bg-slate-50 text-slate-400";
    if (!stats) return "bg-white text-slate-900 hover:bg-slate-50 cursor-pointer";
    if (stats.total > 0 && stats.booked === stats.total) return "bg-[#1E3A5F] text-white cursor-pointer";
    return "bg-[#E3F2FD] text-slate-900 cursor-pointer hover:bg-[#BBDEFB]";
  }

  async function openDay(dateStr: string) {
    if (isPast(dateStr)) return;
    if (!isWorkDay(dateStr)) return;

    setSelectedDate(dateStr);
    setLoading(true);

    try {
      const slots = await getMasterSlotsForDay(masterId, dateStr);
      setDaySlots(slots as SlotWithBooking[]);

      if (slots.length === 0) {
        setModalOpen("create");
      } else {
        setModalOpen("manage");
      }
    } catch {
      toast.error("Ошибка загрузки слотов");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSlots() {
    if (!selectedDate) return;
    setLoading(true);
    try {
      await generateSlotsForDay(masterId, selectedDate, selectedInterval);
      toast.success("Слоты созданы");
      const slots = await getMasterSlotsForDay(masterId, selectedDate);
      setDaySlots(slots as SlotWithBooking[]);
      setModalOpen("manage");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка при создании слотов");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(slot: SlotWithBooking) {
    if (slot.status === "booked") return;
    try {
      await toggleSlotStatus(slot.id);
      setDaySlots((prev) =>
        prev.map((s) =>
          s.id === slot.id ? { ...s, status: s.status === "free" ? "blocked" : "free" } : s
        )
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleCloseAll() {
    if (!selectedDate) return;
    try {
      const result = await closeAllFreeSlots(masterId, selectedDate);
      toast.success(`Закрыто ${result.count} слотов`);
      const slots = await getMasterSlotsForDay(masterId, selectedDate);
      setDaySlots(slots as SlotWithBooking[]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleOpenAll() {
    if (!selectedDate) return;
    try {
      const result = await openAllBlockedSlots(masterId, selectedDate);
      toast.success(`Открыто ${result.count} слотов`);
      const slots = await getMasterSlotsForDay(masterId, selectedDate);
      setDaySlots(slots as SlotWithBooking[]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleDeleteAndRecreate() {
    if (!selectedDate) return;
    try {
      await deleteSlotsForDay(masterId, selectedDate);
      toast.success("Слоты удалены");
      setDaySlots([]);
      setModalOpen("create");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  function calculateSlotCount(): number {
    const sh = parseInt(startTime.split(":")[0], 10);
    const sm = parseInt(startTime.split(":")[1], 10);
    const eh = parseInt(endTime.split(":")[0], 10);
    const em = parseInt(endTime.split(":")[1], 10);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    return Math.floor(totalMinutes / selectedInterval);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-300 text-[#1E293B]">
            BeautyBook
          </Link>
          <form action={logoutMaster}>
            <button type="submit" className="text-sm text-[#64748B] hover:text-[#1E293B] transition-colors">
              Выйти
            </button>
          </form>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 flex gap-6">
          <Link href="/master/dashboard" className="py-3 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors">
            Записи
          </Link>
          <Link href="/master/schedule" className="py-3 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors">
            График
          </Link>
          <Link href="/master/slots" className="py-3 text-sm text-[#1E293B] border-b-2 border-[#1E293B]">
            Слоты
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <h1 className="font-serif text-2xl md:text-3xl font-300 text-[#1E293B] mb-6">
          Управление слотами
        </h1>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 border border-slate-200 hover:bg-[#1E293B] hover:text-white hover:border-[#1E293B] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-serif text-lg md:text-xl font-300 text-[#1E293B]">
            {monthNames[month - 1]} {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 border border-slate-200 hover:bg-[#1E293B] hover:text-white hover:border-[#1E293B] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white border border-slate-100">
          {/* Week days */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekDayLabels.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-[#64748B]">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: adjustedFirstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-r border-b border-slate-50 bg-slate-50/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
              const day = dayIndex + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const stats = statsMap[dateStr];
              const isToday = dateStr === todayStr;
              const dayClass = getDayClass(dateStr, stats);

              return (
                <div
                  key={day}
                  onClick={() => openDay(dateStr)}
                  className={`aspect-square border-r border-b border-slate-100 p-1 md:p-2 relative flex flex-col items-center justify-center transition-colors ${dayClass} ${
                    isToday ? "ring-2 ring-inset ring-[#2196F3]" : ""
                  }`}
                >
                  <span className="text-sm md:text-base font-medium">{day}</span>

                  {stats && stats.total > 0 && (
                    <div className="flex flex-col items-center gap-0.5 mt-0.5">
                      {stats.booked > 0 && (
                        <span className="text-[10px] px-1 py-0.5 bg-[#66BB6A] text-white rounded-sm">
                          {stats.booked}
                        </span>
                      )}
                      {stats.free > 0 && (
                        <span className="text-[10px] text-[#64748B]">{stats.free} св</span>
                      )}
                    </div>
                  )}

                  {!stats && isWorkDay(dateStr) && !isPast(dateStr) && (
                    <Plus className="w-4 h-4 text-[#64748B] mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#E3F2FD] border border-[#BBDEFB]" />Со слотами</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#1E3A5F]" />Все записаны</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white border border-slate-200" />Без слотов</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-50 border border-slate-100" />Выходной</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-100 border border-slate-200" />Прошедший</div>
        </div>
      </main>

      {/* Modal: Create Slots */}
      {modalOpen === "create" && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md p-6">
            <h3 className="font-serif text-xl font-300 text-[#1E293B] mb-1">
              Создать слоты
            </h3>
            <p className="text-sm text-[#64748B] mb-6">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("ru-RU", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </p>

            <label className="block text-sm text-[#64748B] mb-3">Интервал</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {INTERVALS.map((int) => (
                <button
                  key={int}
                  onClick={() => setSelectedInterval(int)}
                  className={`py-2 text-sm border transition-colors ${
                    selectedInterval === int
                      ? "bg-[#1E293B] text-white border-[#1E293B]"
                      : "bg-white text-[#1E293B] border-slate-200 hover:border-[#1E293B]"
                  }`}
                >
                  {int} мин
                </button>
              ))}
            </div>

            <p className="text-sm text-[#64748B] mb-6">
              Будет создано: <span className="font-medium text-[#1E293B]">{calculateSlotCount()}</span> слотов
              <br />
              <span className="text-xs">{startTime} — {endTime}</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCreateSlots}
                disabled={loading}
                className="flex-1 py-3 bg-[#1E293B] text-white text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Создание..." : "Создать"}
              </button>
              <button
                onClick={() => setModalOpen(null)}
                className="flex-1 py-3 border border-slate-300 text-[#1E293B] text-sm hover:bg-slate-100 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manage Slots */}
      {modalOpen === "manage" && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-serif text-xl font-300 text-[#1E293B]">
                {weekDayNames[new Date(selectedDate + "T00:00:00").getDay() === 0 ? 6 : new Date(selectedDate + "T00:00:00").getDay() - 1]}
                {", "}
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
              </h3>

              {/* Stats */}
              <div className="flex gap-3 mt-3">
                <span className="text-xs px-2 py-1 bg-[#E3F2FD] text-[#1E293B]">
                  Свободно: {daySlots.filter((s) => s.status === "free").length}
                </span>
                <span className="text-xs px-2 py-1 bg-[#66BB6A] text-white">
                  Записано: {daySlots.filter((s) => s.status === "booked").length}
                </span>
                <span className="text-xs px-2 py-1 bg-[#EF5350] text-white">
                  Закрыто: {daySlots.filter((s) => s.status === "blocked").length}
                </span>
              </div>

              {/* Bulk actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={handleCloseAll}
                  className="text-xs px-3 py-1.5 border border-slate-200 text-[#64748B] hover:bg-[#1E293B] hover:text-white hover:border-[#1E293B] transition-colors"
                >
                  Закрыть все свободные
                </button>
                <button
                  onClick={handleOpenAll}
                  className="text-xs px-3 py-1.5 border border-slate-200 text-[#64748B] hover:bg-[#1E293B] hover:text-white hover:border-[#1E293B] transition-colors"
                >
                  Открыть все закрытые
                </button>
                {daySlots.filter((s) => s.status === "booked").length === 0 && (
                  <button
                    onClick={handleDeleteAndRecreate}
                    className="text-xs px-3 py-1.5 border border-[#EF5350] text-[#EF5350] hover:bg-[#EF5350] hover:text-white transition-colors"
                  >
                    Удалить и пересоздать
                  </button>
                )}
              </div>
            </div>

            {/* Slots list */}
            <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-2">
              {daySlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => handleToggle(slot)}
                  className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${
                    slot.status === "booked"
                      ? "bg-[#66BB6A]/10 border-[#66BB6A]/30 cursor-default"
                      : slot.status === "blocked"
                      ? "bg-[#EF5350]/10 border-[#EF5350]/30 hover:bg-[#EF5350]/20"
                      : "bg-[#E3F2FD] border-[#BBDEFB] hover:bg-[#BBDEFB]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#1E293B] w-12">{slot.time}</span>
                    {slot.status === "booked" ? (
                      <div className="text-sm">
                        <span className="text-[#1E293B] font-medium">{slot.clientName}</span>
                        {slot.clientPhone && (
                          <span className="text-[#64748B] ml-2">{slot.clientPhone}</span>
                        )}
                      </div>
                    ) : slot.status === "blocked" ? (
                      <span className="text-sm text-[#EF5350]">Закрыто</span>
                    ) : (
                      <span className="text-sm text-[#64748B]">Свободно</span>
                    )}
                  </div>

                  <div>
                    {slot.status === "booked" ? (
                      <Lock className="w-4 h-4 text-[#66BB6A]" />
                    ) : slot.status === "blocked" ? (
                      <Lock className="w-4 h-4 text-[#EF5350]" />
                    ) : (
                      <Unlock className="w-4 h-4 text-[#1E293B]" />
                    )}
                  </div>
                </div>
              ))}

              {daySlots.length === 0 && (
                <div className="text-center py-8 text-[#64748B] text-sm">
                  Нет слотов на этот день
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setModalOpen(null)}
                className="w-full py-3 border border-slate-300 text-[#1E293B] text-sm hover:bg-slate-100 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
