"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDragScroll } from "@/hooks/useDragScroll";
import ClientHistoryModal from "@/components/ClientHistoryModal";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  FileText,
  Tag,
} from "lucide-react";

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
  price: number | null;
}

interface Props {
  masterName: string;
  stats: {
    today: number;
    tomorrow: number;
    week: number;
    total: number;
    revenue: number;
  };
  bookings: TimeBlockItem[];
  filter: string;
  masterId: string;
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

export default function MasterDashboardClient({
  masterName,
  stats,
  bookings,
  filter,
  masterId,
}: Props) {
  const router = useRouter();
  const scrollRef = useDragScroll();

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPhone, setHistoryPhone] = useState("");
  const [historyName, setHistoryName] = useState("");
  const [historyTg, setHistoryTg] = useState("");

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

  function openHistory(phone: string, name: string, tg?: string | null) {
    setHistoryPhone(phone);
    setHistoryName(name);
    setHistoryTg(tg || "");
    setHistoryOpen(true);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-300 text-slate-900 mb-2">
        Здравствуйте, {masterName}
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Ваши записи на ближайшее время
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Сегодня", value: stats.today },
          { label: "Завтра", value: stats.tomorrow },
          { label: "На неделе", value: stats.week },
          { label: "Всего", value: stats.total },
          {
            label: "Выручка",
            value: `${stats.revenue.toLocaleString("ru-RU")} ₽`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 md:p-5"
          >
            <p className="text-xl md:text-2xl font-serif font-300 text-slate-900">
              {s.value}
            </p>
            <p className="text-[10px] md:text-xs text-slate-500 mt-1 uppercase tracking-wider">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => router.push(`/master/dashboard?filter=${f.key}`)}
            className={`px-3 py-1.5 text-xs md:text-sm border transition-colors ${
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
      <div
        ref={scrollRef}
        className="bg-white border border-slate-200 overflow-x-auto drag-scroll"
      >
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Нет записей на выбранный период
          </div>
        ) : (
          <table className="w-full min-w-[1400px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-3 py-2 md:px-4 md:py-3 font-normal whitespace-nowrap text-xs md:text-sm">
                  Дата
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-normal whitespace-nowrap text-xs md:text-sm">
                  Время
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-normal whitespace-nowrap text-xs md:text-sm">
                  Клиент
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-normal whitespace-nowrap hidden md:table-cell text-xs md:text-sm">
                  Телефон
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-normal whitespace-nowrap hidden lg:table-cell text-xs md:text-sm">
                  Telegram
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-normal whitespace-nowrap hidden lg:table-cell text-xs md:text-sm">
                  Комментарий
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-normal whitespace-nowrap text-xs md:text-sm">
                  Статус
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-normal whitespace-nowrap text-xs md:text-sm text-right">
                  Стоимость
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs md:text-sm">
                        {formatDate(b.date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs md:text-sm">
                        {b.startTime} – {b.endTime}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <button
                        onClick={() =>
                          openHistory(
                            b.clientPhone || "",
                            b.clientName || "",
                            b.clientTg
                          )
                        }
                        className="text-xs md:text-sm hover:text-sky-600 hover:underline transition-colors cursor-pointer text-left"
                      >
                        {b.clientName || "—"}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs md:text-sm">
                        {b.clientPhone || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs md:text-sm">
                        {b.clientTg || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap hidden lg:table-cell max-w-xs truncate">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-xs md:text-sm">
                        {b.comment || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs ${
                        statusColors[b.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {statusLabels[b.status] || b.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-right">
                    <span className="text-xs md:text-sm text-slate-700">
                      {b.price
                        ? `${b.price.toLocaleString("ru-RU")} ₽`
                        : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ClientHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        phone={historyPhone}
        name={historyName}
        tg={historyTg}
        masterId={masterId}
      />
    </div>
  );
}
