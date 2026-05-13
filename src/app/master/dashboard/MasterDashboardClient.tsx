"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutMaster } from "../actions";
import { Calendar, Clock, User, Phone, MessageCircle, FileText, Tag } from "lucide-react";

interface TimeBlockItem {
  id: string;
  status: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  clientName: string | null;
  clientPhone: string | null;
  clientTg: string | null;
  comment: string | null;
  serviceName: string | null;
}

interface Props {
  masterName: string;
  stats: { today: number; tomorrow: number; week: number; total: number };
  bookings: TimeBlockItem[];
  filter: string;
}

const statusLabels: Record<string, string> = {
  confirmed: "Подтверждена",
  completed: "Выполнена",
  cancelled: "Отменена",
  "no-show": "Не пришёл",
  new: "Новая",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-700",
  "no-show": "bg-red-50 text-red-500",
  new: "bg-sky-100 text-sky-700",
};

export default function MasterDashboardClient({ masterName, stats, bookings, filter }: Props) {
  const router = useRouter();

  const filters = [
    { key: "today", label: "Сегодня" },
    { key: "tomorrow", label: "Завтра" },
    { key: "week", label: "Неделя" },
    { key: "month", label: "Месяц" },
    { key: "", label: "Все" },
  ];

  function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("ru-RU");
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-300 text-slate-900">
            BeautyBook
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:inline">{masterName}</span>
            <form action={logoutMaster}>
              <button
                type="submit"
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 flex gap-6">
          <Link
            href="/master/dashboard"
            className="py-3 text-sm text-slate-900 border-b-2 border-slate-900"
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
            href="/master/diary"
            className="py-3 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Дневник
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-300 text-slate-900 mb-2">
          Здравствуйте, {masterName}
        </h1>
        <p className="text-slate-500 text-sm mb-8">Ваши записи на ближайшее время</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Сегодня", value: stats.today },
            { label: "Завтра", value: stats.tomorrow },
            { label: "На неделе", value: stats.week },
            { label: "Всего", value: stats.total },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-100 p-5">
              <p className="text-2xl font-serif font-300 text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => router.push(`/master/dashboard?filter=${f.key}`)}
              className={`px-4 py-2 text-sm border transition-colors ${
                filter === f.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="bg-white border border-slate-100 overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Нет записей на выбранный период
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-4 py-3 font-normal whitespace-nowrap">Дата</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap">Время</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap">Клиент</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap hidden md:table-cell">Телефон</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap hidden lg:table-cell">Telegram</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap hidden lg:table-cell">Комментарий</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap">Статус</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(b.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {b.startTime} – {b.endTime}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {b.clientName || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {b.clientPhone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                        {b.clientTg || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {b.comment || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${statusColors[b.status] || "bg-slate-100 text-slate-600"}`}>
                        <Tag className="w-3 h-3" />
                        {statusLabels[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
