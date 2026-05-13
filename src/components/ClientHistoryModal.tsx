"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { getClientHistory } from "@/app/actions";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  name: string;
  tg?: string | null;
  masterId?: string;
}

export default function ClientHistoryModal({
  open,
  onOpenChange,
  phone,
  name,
  tg,
  masterId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlockWithMaster[]>([]);

  useEffect(() => {
    if (!open || !phone) return;
    setLoading(true);
    getClientHistory(phone, masterId)
      .then((res) => setData(res as BlockWithMaster[]))
      .catch(() => toast.error("Ошибка загрузки истории"))
      .finally(() => setLoading(false));
  }, [open, phone, masterId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none bg-white border border-slate-200 shadow-2xl w-[90vw] max-w-[700px] max-h-[85vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <DialogTitle className="font-serif text-xl font-300 text-slate-900">
            История клиента
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 overflow-y-auto">
          {/* Client info */}
          <div className="bg-slate-50 border border-slate-100 px-4 py-3 text-sm">
            <p>
              <span className="text-slate-400">Имя:</span>{" "}
              <span className="text-slate-900">{name || "—"}</span>
            </p>
            <p className="mt-1">
              <span className="text-slate-400">Телефон:</span>{" "}
              <span className="text-slate-900">{phone || "—"}</span>
            </p>
            {tg && (
              <p className="mt-1">
                <span className="text-slate-400">Telegram:</span>{" "}
                <span className="text-slate-900">{tg}</span>
              </p>
            )}
            <p className="mt-1">
              <span className="text-slate-400">Всего визитов:</span>{" "}
              <span className="text-slate-900">{data.length}</span>
            </p>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-sm text-slate-400">Загрузка...</p>
          ) : data.length === 0 ? (
            <p className="text-sm text-slate-400">Нет записей</p>
          ) : (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="py-2 px-2 font-normal">Дата</th>
                    <th className="py-2 px-2 font-normal">Время</th>
                    <th className="py-2 px-2 font-normal">Мастер</th>
                    <th className="py-2 px-2 font-normal">Услуга</th>
                    <th className="py-2 px-2 font-normal">Статус</th>
                    {!masterId && (
                      <th className="py-2 px-2 font-normal text-right">Стоимость</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2 text-slate-700 whitespace-nowrap">
                        {new Date(h.date).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="py-2 px-2 text-slate-700 whitespace-nowrap">
                        {h.startTime} – {h.endTime}
                      </td>
                      <td className="py-2 px-2 text-slate-700 whitespace-nowrap">
                        {h.master.name}
                      </td>
                      <td className="py-2 px-2 text-slate-500 whitespace-nowrap">
                        {h.serviceName || h.master.service.name}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 text-xs border ${
                            statusColors[h.status] ||
                            "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {statusLabels[h.status] || h.status}
                        </span>
                      </td>
                      {!masterId && (
                        <td className="py-2 px-2 text-right whitespace-nowrap text-slate-700">
                          {h.price ? `${h.price.toLocaleString("ru-RU")} ₽` : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
