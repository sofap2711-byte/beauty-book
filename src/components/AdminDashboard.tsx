"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getBookings,
  cancelBooking,
  updateBookingStatus,
  updateAdminNotes,
  getClientHistory,
} from "@/app/actions";
import { logoutAdmin } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Booking, Slot, Master, Service } from "@prisma/client";

type BookingWithSlot = Booking & {
  slot: Slot & {
    master: Master & { service: Service };
  };
};

const statusLabels: Record<string, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled: "Отменена",
};

const statusColors: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-500 border-slate-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingWithSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterMaster, setFilterMaster] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPhone, setHistoryPhone] = useState("");
  const [historyName, setHistoryName] = useState("");
  const [historyTg, setHistoryTg] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<BookingWithSlot[]>([]);

  // Notes modal
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesBookingId, setNotesBookingId] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getBookings()
      .then((data) => {
        setBookings(data as BookingWithSlot[]);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Ошибка загрузки записей");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const weekEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const monthEndStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterDate === "today" && b.slot.date !== todayStr) return false;
      if (filterDate === "tomorrow" && b.slot.date !== tomorrowStr) return false;
      if (filterDate === "week" && (b.slot.date < todayStr || b.slot.date > weekEndStr))
        return false;
      if (filterDate === "month" && (b.slot.date < todayStr || b.slot.date > monthEndStr))
        return false;
      if (filterMaster !== "all" && b.slot.master.id !== filterMaster) return false;
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      return true;
    });
  }, [bookings, filterDate, filterMaster, filterStatus, todayStr, tomorrowStr, weekEndStr, monthEndStr]);

  const stats = useMemo(() => {
    const todayCount = bookings.filter((b) => b.slot.date === todayStr).length;
    const weekCount = bookings.filter(
      (b) => b.slot.date >= todayStr && b.slot.date <= weekEndStr
    ).length;
    const monthCount = bookings.filter(
      (b) => b.slot.date >= todayStr && b.slot.date <= monthEndStr
    ).length;
    const newCount = bookings.filter((b) => b.status === "new").length;
    return { todayCount, weekCount, monthCount, newCount };
  }, [bookings, todayStr, weekEndStr, monthEndStr]);

  const masters = useMemo(() => {
    const map = new Map<string, string>();
    bookings.forEach((b) => map.set(b.slot.master.id, b.slot.master.name));
    return Array.from(map.entries());
  }, [bookings]);

  const handleCancel = async (bookingId: string, slotId: string) => {
    try {
      await cancelBooking(slotId);
      toast.success("Запись отменена");
      load();
    } catch {
      toast.error("Ошибка при отмене");
    }
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast.success("Статус обновлён");
      load();
    } catch {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const openHistory = async (phone: string, name: string, tg?: string | null) => {
    setHistoryPhone(phone);
    setHistoryName(name);
    setHistoryTg(tg || "");
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await getClientHistory(phone);
      setHistoryData(data as BookingWithSlot[]);
    } catch {
      toast.error("Ошибка загрузки истории");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openNotes = (bookingId: string, currentNotes?: string | null) => {
    setNotesBookingId(bookingId);
    setNotesValue(currentNotes || "");
    setNotesOpen(true);
  };

  const saveNotes = async () => {
    if (!notesBookingId) return;
    setNotesSaving(true);
    try {
      await updateAdminNotes(notesBookingId, notesValue);
      toast.success("Заметки сохранены");
      setNotesOpen(false);
      load();
    } catch {
      toast.error("Ошибка при сохранении заметок");
    } finally {
      setNotesSaving(false);
    }
  };

  const applyDateFilter = (value: string) => {
    setFilterDate(value);
    setDateDropdownOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="font-serif text-4xl text-slate-900 font-300">Записи салона</h1>
          <p className="text-slate-500 text-sm mt-1">Управление бронированиями</p>
        </div>
        <form action={logoutAdmin}>
          <Button
            type="submit"
            variant="outline"
            className="rounded-none border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm"
          >
            Выйти
          </Button>
        </form>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {/* Today — clickable with dropdown */}
        <div className="relative">
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="w-full bg-white border border-slate-100 p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Сегодня</div>
                <div className="font-serif text-3xl text-slate-900">{stats.todayCount}</div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${dateDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {dateDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-100 shadow-lg mt-1">
              <button
                onClick={() => applyDateFilter("today")}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${filterDate === "today" ? "text-slate-900 bg-slate-50" : "text-slate-600"}`}
              >
                Сегодня
              </button>
              <button
                onClick={() => applyDateFilter("week")}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${filterDate === "week" ? "text-slate-900 bg-slate-50" : "text-slate-600"}`}
              >
                На этой неделе
              </button>
              <button
                onClick={() => applyDateFilter("month")}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${filterDate === "month" ? "text-slate-900 bg-slate-50" : "text-slate-600"}`}
              >
                В этом месяце
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-100 p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Всего активных</div>
          <div className="font-serif text-3xl text-slate-900">{bookings.length}</div>
        </div>
        <div className="bg-white border border-slate-100 p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Новые</div>
          <div className="font-serif text-3xl text-amber-600">{stats.newCount}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-none border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-sky-300"
        >
          <option value="all">Все даты</option>
          <option value="today">Сегодня</option>
          <option value="tomorrow">Завтра</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
        </select>
        <select
          value={filterMaster}
          onChange={(e) => setFilterMaster(e.target.value)}
          className="rounded-none border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-sky-300"
        >
          <option value="all">Все мастера</option>
          {masters.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-none border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-sky-300"
        >
          <option value="all">Все статусы</option>
          <option value="new">Новая</option>
          <option value="confirmed">Подтверждена</option>
          <option value="completed">Завершена</option>
        </select>
        <Button
          onClick={load}
          variant="outline"
          className="rounded-none border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm"
        >
          Обновить
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">Нет записей</p>
      ) : (
        <div className="bg-white border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-normal">Дата</th>
                <th className="px-4 py-3 font-normal">Время</th>
                <th className="px-4 py-3 font-normal">Мастер</th>
                <th className="px-4 py-3 font-normal">Услуга</th>
                <th className="px-4 py-3 font-normal">Клиент</th>
                <th className="px-4 py-3 font-normal">Телефон</th>
                <th className="px-4 py-3 font-normal">Telegram</th>
                <th className="px-4 py-3 font-normal">Комментарий</th>
                <th className="px-4 py-3 font-normal">Статус</th>
                <th className="px-4 py-3 font-normal">Заметки</th>
                <th className="px-4 py-3 font-normal text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {new Date(b.slot.date + "T00:00:00").toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{b.slot.time}</td>
                  <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{b.slot.master.name}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {b.slot.master.service.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    <button
                      onClick={() => openHistory(b.clientPhone, b.clientName, b.clientTg)}
                      className="hover:text-sky-600 hover:underline transition-colors cursor-pointer"
                    >
                      {b.clientName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{b.clientPhone}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{b.clientTg || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                    {b.comment || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs border ${
                        statusColors[b.status] || "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {statusLabels[b.status] || b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => openNotes(b.id, b.adminNotes)}
                      className="text-slate-400 hover:text-sky-500 transition-colors"
                      title="Заметки админа"
                    >
                      {b.adminNotes ? "💬" : "📝"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === "new" && (
                        <Button
                          onClick={() => handleStatusChange(b.id, "confirmed")}
                          variant="outline"
                          size="sm"
                          className="rounded-none border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all text-xs"
                        >
                          Подтвердить
                        </Button>
                      )}
                      {b.status === "confirmed" && (
                        <Button
                          onClick={() => handleStatusChange(b.id, "completed")}
                          variant="outline"
                          size="sm"
                          className="rounded-none border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all text-xs"
                        >
                          Клиент пришёл
                        </Button>
                      )}
                      {b.status !== "completed" && b.status !== "cancelled" && (
                        <Button
                          onClick={() => handleCancel(b.id, b.slotId)}
                          variant="outline"
                          size="sm"
                          className="rounded-none border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all text-xs"
                        >
                          Отменить
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="rounded-none bg-white border border-slate-200 shadow-2xl max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="font-serif text-slate-900 text-2xl font-300">
              История клиента
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-slate-50 border border-slate-100 px-4 py-3 text-sm">
              <p>
                <span className="text-slate-400">Имя:</span>{" "}
                <span className="text-slate-900">{historyName}</span>
              </p>
              <p className="mt-1">
                <span className="text-slate-400">Телефон:</span>{" "}
                <span className="text-slate-900">{historyPhone}</span>
              </p>
              {historyTg && (
                <p className="mt-1">
                  <span className="text-slate-400">Telegram:</span>{" "}
                  <span className="text-slate-900">{historyTg}</span>
                </p>
              )}
              <p className="mt-1">
                <span className="text-slate-400">Всего визитов:</span>{" "}
                <span className="text-slate-900">{historyData.length}</span>
              </p>
            </div>

            {historyLoading ? (
              <p className="text-sm text-slate-400">Загрузка...</p>
            ) : historyData.length === 0 ? (
              <p className="text-sm text-slate-400">Нет записей</p>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400 bg-white">
                      <th className="px-3 py-2 font-normal">Дата</th>
                      <th className="px-3 py-2 font-normal">Время</th>
                      <th className="px-3 py-2 font-normal">Мастер</th>
                      <th className="px-3 py-2 font-normal">Услуга</th>
                      <th className="px-3 py-2 font-normal">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {historyData.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                          {new Date(h.slot.date + "T00:00:00").toLocaleDateString("ru-RU")}
                        </td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{h.slot.time}</td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{h.slot.master.name}</td>
                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                          {h.slot.master.service.name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 text-xs border ${
                              statusColors[h.status] || "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {statusLabels[h.status] || h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setHistoryOpen(false)}
                variant="outline"
                className="rounded-none border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="rounded-none bg-white border border-slate-200 shadow-2xl max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="font-serif text-slate-900 text-2xl font-300">
              Заметки админа
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Введите заметки..."
              rows={4}
              className="w-full rounded-none border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-200 transition-colors resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setNotesOpen(false)}
                variant="outline"
                className="rounded-none border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all text-sm"
              >
                Отмена
              </Button>
              <Button
                onClick={saveNotes}
                disabled={notesSaving}
                className="rounded-none bg-slate-900 hover:bg-slate-800 text-white transition-all text-sm"
              >
                {notesSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
