"use client";

import { useState, useEffect, useMemo } from "react";
import { getBookings, cancelBooking } from "@/app/actions";
import { logoutAdmin } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Slot, Master, Service } from "@prisma/client";

type BookingWithMaster = Slot & {
  master: Master & { service: Service };
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingWithMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterMaster, setFilterMaster] = useState<string>("all");

  const load = () => {
    setLoading(true);
    getBookings().then((data) => {
      setBookings(data as BookingWithMaster[]);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const weekEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterDate === "today" && b.date !== todayStr) return false;
      if (filterDate === "tomorrow" && b.date !== tomorrowStr) return false;
      if (filterDate === "week" && (b.date < todayStr || b.date > weekEndStr)) return false;
      if (filterMaster !== "all" && b.master.id !== filterMaster) return false;
      return true;
    });
  }, [bookings, filterDate, filterMaster, todayStr, tomorrowStr, weekEndStr]);

  const stats = useMemo(() => {
    const todayCount = bookings.filter((b) => b.date === todayStr).length;
    const weekCount = bookings.filter(
      (b) => b.date >= todayStr && b.date <= weekEndStr
    ).length;
    return { todayCount, weekCount };
  }, [bookings, todayStr, weekEndStr]);

  const masters = useMemo(() => {
    const map = new Map<string, string>();
    bookings.forEach((b) => map.set(b.master.id, b.master.name));
    return Array.from(map.entries());
  }, [bookings]);

  const handleCancel = async (slotId: string) => {
    try {
      await cancelBooking(slotId);
      toast.success("Запись отменена");
      load();
    } catch {
      toast.error("Ошибка при отмене");
    }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-slate-100 p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Сегодня</div>
          <div className="font-serif text-3xl text-slate-900">{stats.todayCount}</div>
        </div>
        <div className="bg-white border border-slate-100 p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">На этой неделе</div>
          <div className="font-serif text-3xl text-slate-900">{stats.weekCount}</div>
        </div>
        <div className="bg-white border border-slate-100 p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Всего активных</div>
          <div className="font-serif text-3xl text-slate-900">{bookings.length}</div>
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
                <th className="px-4 py-3 font-normal text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {new Date(b.date).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{b.time}</td>
                  <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{b.master.name}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {b.master.service.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{b.clientName}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{b.clientPhone}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{b.clientTg || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                    {b.comment || "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button
                      onClick={() => handleCancel(b.id)}
                      variant="outline"
                      size="sm"
                      className="rounded-none border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all text-xs"
                    >
                      Отменить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
