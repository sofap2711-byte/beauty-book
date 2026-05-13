"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, FileText, Banknote } from "lucide-react";
import { getClientHistory } from "@/app/actions";
import { toast } from "sonner";
import type { TimeBlock, Master, Service } from "@prisma/client";

type BlockWithMaster = TimeBlock & {
  master: Master & { service: Service };
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
      <DialogContent className="rounded-none bg-white border border-slate-200 shadow-2xl w-[92vw] max-w-[800px] max-h-[85vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
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

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
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
                  <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-2 px-3 font-normal">Дата</th>
                    <th className="py-2 px-3 font-normal">Мастер</th>
                    <th className="py-2 px-3 font-normal">Услуга</th>
                    <th className="py-2 px-3 font-normal text-center">
                      <Banknote className="w-4 h-4 inline-block" strokeWidth={1.5} />
                    </th>
                    <th className="py-2 px-3 font-normal text-center">
                      <FileText className="w-4 h-4 inline-block" strokeWidth={1.5} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                        {new Date(h.date).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                        {h.master.name}
                      </td>
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                        {h.serviceName || h.master.service.name}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap text-slate-700">
                        {h.price ? `${h.price.toLocaleString("ru-RU")} ₽` : "—"}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span
                          title={h.comment || undefined}
                          className="inline-flex items-center justify-center"
                        >
                          <FileText
                            className={`w-4 h-4 ${
                              h.comment
                                ? "text-sky-400"
                                : "text-slate-300"
                            }`}
                            strokeWidth={1.5}
                          />
                        </span>
                      </td>
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
