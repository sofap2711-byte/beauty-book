"use client";

import { useState, useEffect, useMemo } from "react";
import { useDragScroll } from "@/hooks/useDragScroll";
import Link from "next/link";
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
import type { TimeBlock, Master, Service } from "@prisma/client";

type BlockWithMaster = TimeBlock & {
  master: Master & { service: Service };
};

const statusLabels: Record<string, string> = {
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled: "Отменена",
  "no-show": "Не пришёл",
  new: "Новая",
};

const statusColors: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-500 border-slate-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
  "no-show": "bg-red-50 text-red-400 border-red-100",
};

const periodLabels: Record<string, string> = {
  today: "Сегодня",
  week: "На этой неделе",
  month: "В этом месяце",
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getSunday(d: Date): Date {
  const monday = getMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminDashboard() {
  const scrollRef = useDragScroll();
  const [blocks, setBlocks] = useState<BlockWithMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableFilterDate, setTableFilterDate] = useState<string>("all");
  const [filterMaster, setFilterMaster] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Stat card period
  const [statPeriod, setStatPeriod] = useState<string>("today");
  const [statDropdownOpen, setStatDropdownOpen] = useState(false);

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPhone, setHistoryPhone] = useState("");
  const [historyName, setHistoryName] = useState("");
  const [historyTg, setHistoryTg] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<BlockWithMaster[]>([]);

  // Notes modal
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesBlockId, setNotesBlockId] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getBookings()
      .then((data) => {
        setBlocks(data as BlockWithMaster[]);
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

  const todayStr = useMemo(() => formatDateStr(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateStr(d);
  }, []);
  const weekEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return formatDateStr(d);
  }, []);
  const monthEndStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return formatDateStr(d);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const mondayStr = formatDateStr(getMonday(now));
    const sundayStr = formatDateStr(getSunday(now));
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthEndStrFormatted = formatDateStr(monthEnd);

    const todayCount = blocks.filter((b) => formatDateStr(new Date(b.date)) === todayStr).length;
    const weekCount = blocks.filter(
      (b) => formatDateStr(new Date(b.date)) >= mondayStr && formatDateStr(new Date(b.date)) <= sundayStr
    ).length;
    const monthCount = blocks.filter(
      (b) => formatDateStr(new Date(b.date)) >= monthStartStr && formatDateStr(new Date(b.date)) <= monthEndStrFormatted
    ).length;
    const activeCount = blocks.filter(
      (b) => b.status === "confirmed"
    ).length;
    const newCount = blocks.filter((b) => b.source === "online" && b.status === "confirmed").length;

    return { todayCount, weekCount, monthCount, activeCount, newCount };
  }, [blocks, todayStr]);

  const statValue = useMemo(() => {
    switch (statPeriod) {
      case "today":
        return stats.todayCount;
      case "week":
        return stats.weekCount;
      case "month":
        return stats.monthCount;
      default:
        return stats.todayCount;
    }
  }, [stats, statPeriod]);

  const filtered = useMemo(() => {
    return blocks.filter((b) => {
      const dateStr = formatDateStr(new Date(b.date));
      if (tableFilterDate === "today" && dateStr !== todayStr) return false;
      if (tableFilterDate === "tomorrow" && dateStr !== tomorrowStr) return false;
      if (tableFilterDate === "week" && (dateStr < todayStr || dateStr > weekEndStr)) return false;
      if (tableFilterDate === "month" && (dateStr < todayStr || dateStr > monthEndStr)) return false;
      if (filterMaster !== "all" && b.master.id !== filterMaster) return false;
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      return true;
    });
  }, [
    blocks,
    tableFilterDate,
    filterMaster,
    filterStatus,
    todayStr,
    tomorrowStr,
    weekEndStr,
    monthEndStr,
  ]);

  const masters = useMemo(() => {
    const map = new Map<string, string>();
    blocks.forEach((b) => map.set(b.master.id, b.master.name));
    return Array.from(map.entries());
  }, [blocks]);

  const handleCancel = async (blockId: string) => {
    try {
      await cancelBooking(blockId);
      toast.success("Запись отменена");
      load();
    } catch {
      toast.error("Ошибка при отмене");
    }
  };

  const handleStatusChange = async (blockId: string, status: string) => {
    try {
      await updateBookingStatus(blockId, status);
      toast.success("Статус обновлён");
      load();
    } catch {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const openHistory = async (
    phone: string,
    name: string,
    tg?: string | null
  ) => {
    setHistoryPhone(phone);
    setHistoryName(name);
    setHistoryTg(tg || "");
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await getClientHistory(phone);
      setHistoryData(data as BlockWithMaster[]);
    } catch {
      toast.error("Ошибка загрузки истории");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openNotes = (blockId: string, currentNotes?: string | null) => {
    setNotesBlockId(blockId);
    setNotesValue(currentNotes || "");
    setNotesOpen(true);
  };

  const saveNotes = async () => {
    if (!notesBlockId) return;
    setNotesSaving(true);
    try {
      await updateAdminNotes(notesBlockId, notesValue);
      toast.success("Заметки сохранены");
      setNotesOpen(false);
      load();
    } catch {
      toast.error("Ошибка при сохранении заметок");
    } finally {
      setNotesSaving(false);
    }
  };

  const applyStatPeriod = (value: string) => {
    setStatPeriod(value);
    setStatDropdownOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="font-serif text-4xl text-slate-900 font-300">
            Записи салона
          </h1>
          <p className="text-slate-500 text-sm mt-1">Управление бронированиями</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/master/login">
            <Button
              variant="outline"
              className="rounded-none border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm"
            >
              👤 Кабинет мастера
            </Button>
          </Link>
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
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {/* Period stat — clickable with dropdown */}
        <div className="relative">
          <button
            onClick={() => setStatDropdownOpen(!statDropdownOpen)}
            className="w-full bg-white border border-slate-100 p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  {periodLabels[statPeriod]}
                </div>
                <div className="font-serif text-3xl text-slate-900">
                  {statValue}
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${statDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {statDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-100 shadow-lg mt-1">
              <button
                onClick={() => applyStatPeriod("today")}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${statPeriod === "today" ? "text-slate-900 bg-slate-50" : "text-slate-600"}`}
              >
                Сегодня
              </button>
              <button
                onClick={() => applyStatPeriod("week")}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${statPeriod === "week" ? "text-slate-900 bg-slate-50" : "text-slate-600"}`}
              >
                На этой неделе
              </button>
              <button
                onClick={() => applyStatPeriod("month")}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${statPeriod === "month" ? "text-slate-900 bg-slate-50" : "text-slate-600"}`}
              >
                В этом месяце
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-100 p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Всего активных
          </div>
          <div className="font-serif text-3xl text-slate-900">
            {stats.activeCount}
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Новые
          </div>
          <div className="font-serif text-3xl text-amber-600">
            {stats.newCount}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={tableFilterDate}
          onChange={(e) => setTableFilterDate(e.target.value)}
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
          <option value="confirmed">Подтверждена</option>
          <option value="completed">Завершена</option>
          <option value="cancelled">Отменена</option>
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
        <div ref={scrollRef} className="bg-white border border-slate-100 overflow-x-auto drag-scroll">
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
                <tr
                  key={b.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {new Date(b.date).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {b.startTime} – {b.endTime}
                  </td>
                  <td className="px-4 py-3 text-slate-900 whitespace-nowrap">
                    {b.master.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {b.serviceName || b.master.service.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    <button
                      onClick={() =>
                        openHistory(b.clientPhone || "", b.clientName || "", b.clientTg)
                      }
                      className="hover:text-sky-600 hover:underline transition-colors cursor-pointer"
                    >
                      {b.clientName || "—"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {b.clientPhone || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {b.clientTg || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                    {b.comment || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs border ${
                        statusColors[b.status] ||
                        "bg-slate-100 text-slate-500 border-slate-200"
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
                      {b.status === "confirmed" && (
                        <Button
                          onClick={() =>
                            handleStatusChange(b.id, "completed")
                          }
                          variant="outline"
                          size="sm"
                          className="rounded-none border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all text-xs"
                        >
                          Клиент пришёл
                        </Button>
                      )}
                      {b.status !== "completed" && b.status !== "cancelled" && (
                        <Button
                          onClick={() => handleCancel(b.id)}
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
                          {new Date(h.date).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                          {h.startTime} – {h.endTime}
                        </td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                          {h.master.name}
                        </td>
                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                          {h.serviceName || h.master.service.name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 text-xs border ${
                              statusColors[h.status] ||
                              "bg-slate-100 text-slate-500 border-slate-200"
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
