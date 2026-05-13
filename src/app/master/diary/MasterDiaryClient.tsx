"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getMasterDayBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  getMasterBlocksForMonth,
} from "../actions";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  CheckCircle2,
  UserPlus,
  Lock,
  Phone,
  MessageCircle,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";

interface TimeBlock {
  id: string;
  masterId: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  type: string;
  clientName: string | null;
  clientPhone: string | null;
  clientTg: string | null;
  serviceName: string | null;
  comment: string | null;
  source: string;
  status: string;
  price: number | null;
}

interface Props {
  masterId: string;
  masterName: string;
  startTime: string;
  endTime: string;
  initialDate: string;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled: "Отменена",
  "no-show": "Не пришёл",
};

const STATUS_CHIPS = [
  { key: "confirmed", label: "Подтверждена" },
  { key: "completed", label: "Завершена" },
  { key: "cancelled", label: "Отменена" },
  { key: "no-show", label: "Не пришёл" },
];

const DURATIONS = [30, 60, 90, 120];

function formatDateRu(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function addMinutes(time: string, minutes: number): string {
  return formatTime(parseTime(time) + minutes);
}

function getBlockStyle(block: TimeBlock) {
  if (block.status === "cancelled" || block.status === "no-show") {
    return {
      bg: "bg-red-50/60",
      border: "border-red-200",
      leftBar: "bg-red-400",
      iconColor: "text-red-400",
      textColor: "text-red-600",
    };
  }
  if (block.status === "completed") {
    return {
      bg: "bg-sky-50/40",
      border: "border-sky-200",
      leftBar: "bg-sky-300",
      iconColor: "text-sky-400",
      textColor: "text-sky-600",
    };
  }
  if (block.source === "online") {
    return {
      bg: "bg-sky-50/60",
      border: "border-sky-300",
      leftBar: "bg-sky-400",
      iconColor: "text-sky-400",
      textColor: "text-slate-900",
    };
  }
  if (block.type === "blocked") {
    return {
      bg: "bg-slate-50/60",
      border: "border-slate-200",
      leftBar: "bg-slate-300",
      iconColor: "text-slate-400",
      textColor: "text-slate-500",
    };
  }
  return {
    bg: "bg-white/80",
    border: "border-slate-200",
    leftBar: "bg-slate-400",
    iconColor: "text-slate-400",
    textColor: "text-slate-900",
  };
}

export default function MasterDiaryClient({
  masterId,
  startTime,
  endTime,
  initialDate,
}: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<"add" | "edit" | "calendar" | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [monthBlocks, setMonthBlocks] = useState<Record<string, { hasBooking: boolean; hasBlocked: boolean }>>({});

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMasterDayBlocks(masterId, date);
      setBlocks(data);
    } catch {
      toast.error("Ошибка загрузки записей");
    } finally {
      setLoading(false);
    }
  }, [masterId, date]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const loadMonthBlocks = useCallback(async () => {
    try {
      const data = await getMasterBlocksForMonth(masterId, calYear, calMonth);
      const map: Record<string, { hasBooking: boolean; hasBlocked: boolean }> = {};
      for (const d of data) {
        map[d.date] = { hasBooking: d.hasBooking, hasBlocked: d.hasBlocked };
      }
      setMonthBlocks(map);
    } catch {
      // ignore
    }
  }, [masterId, calYear, calMonth]);

  useEffect(() => {
    if (modal === "calendar") {
      loadMonthBlocks();
    }
  }, [modal, loadMonthBlocks]);

  function navigateDay(delta: number) {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + delta);
    const newDate = d.toISOString().split("T")[0];
    setDate(newDate);
    router.push(`/master/diary?date=${newDate}`, { scroll: false });
  }

  function goToToday() {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    router.push(`/master/diary?date=${today}`, { scroll: false });
  }

  const stats = useMemo(() => {
    const bookings = blocks.filter((b) => b.type === "booking" && b.status !== "cancelled");
    const completed = blocks.filter((b) => b.status === "completed").length;
    const revenue = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0);
    return { bookings: bookings.length, completed, revenue };
  }, [blocks]);

  const timelineItems = useMemo(() => {
    const items: Array<{ kind: "block"; block: TimeBlock } | { kind: "empty"; start: string; end: string }> = [];
    const startMin = parseTime(startTime);
    const endMin = parseTime(endTime);
    const sorted = [...blocks].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
    let currentMin = startMin;

    for (const block of sorted) {
      const blockStart = parseTime(block.startTime);
      const blockEnd = parseTime(block.endTime);
      if (blockStart > currentMin) {
        items.push({ kind: "empty", start: formatTime(currentMin), end: formatTime(blockStart) });
      }
      items.push({ kind: "block", block });
      currentMin = Math.max(currentMin, blockEnd);
    }

    if (currentMin < endMin) {
      items.push({ kind: "empty", start: formatTime(currentMin), end: formatTime(endMin) });
    }

    return items;
  }, [blocks, startTime, endTime]);

  return (
    <div>
      {/* Day Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateDay(-1)}
          className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="text-xs px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wider"
          >
            Сегодня
          </button>
          <h1 className="font-serif text-xl font-300 text-slate-900">
            {formatDateRu(date)}
          </h1>
        </div>

        <button
          onClick={() => navigateDay(1)}
          className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white/80 backdrop-blur-md border border-slate-200/60 px-6 py-4">
          <div className="text-3xl font-serif font-300 text-slate-900">{stats.bookings}</div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">Записи</div>
        </div>
        <div className="flex-1 bg-white/80 backdrop-blur-md border border-slate-200/60 px-6 py-4">
          <div className="text-3xl font-serif font-300 text-slate-900">{stats.completed}</div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">Завершено</div>
        </div>
        <div className="flex-1 bg-white/80 backdrop-blur-md border border-slate-200/60 px-6 py-4">
          <div className="text-3xl font-serif font-300 text-emerald-600">
            {stats.revenue.toLocaleString("ru-RU")} ₽
          </div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">Выручка</div>
        </div>
        <button
          onClick={() => setModal("calendar")}
          className="flex-1 bg-white/80 backdrop-blur-md border border-slate-200/60 px-6 py-4 flex flex-col items-center justify-center hover:bg-white transition-colors"
        >
          <CalendarDays className="w-5 h-5 mb-1 text-sky-400" strokeWidth={1.5} />
          <div className="text-xs uppercase tracking-wide text-slate-500">Календарь</div>
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingBlock(null);
          setModal("add");
        }}
        className="w-full mb-6 py-3 bg-slate-900 text-white text-sm tracking-wide hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Добавить запись
        </span>
      </button>

      {/* Timeline */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-sm text-slate-400">Загрузка...</div>
        ) : timelineItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-sm text-slate-400 mb-4">Нет записей на этот день</div>
            <button
              onClick={() => setModal("add")}
              className="text-sm px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Добавить первую запись
            </button>
          </div>
        ) : (
          timelineItems.map((item, idx) => {
            if (item.kind === "empty") {
              return (
                <button
                  key={`empty-${idx}`}
                  onClick={() => {
                    setEditingBlock(null);
                    setModal("add");
                  }}
                  className="w-full py-2 border border-dashed border-slate-200 flex items-center justify-center gap-1 text-slate-400 hover:border-sky-400 hover:text-sky-500 transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs">
                    {item.start} – {item.end}
                  </span>
                </button>
              );
            }

            const block = item.block;
            const style = getBlockStyle(block);
            const duration = parseTime(block.endTime) - parseTime(block.startTime);
            const isBlocked = block.type === "blocked";

            return (
              <div
                key={block.id}
                className={`relative border ${style.bg} ${style.border} overflow-hidden transition-all hover:shadow-sm`}
              >
                {/* Left indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${style.leftBar}`} />

                <div className="pl-4 pr-3 py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Time */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-semibold tabular-nums text-slate-900">
                          {block.startTime}
                        </span>
                        <span className="text-xs text-slate-400">– {block.endTime}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 uppercase tracking-wider">
                          {duration} мин
                        </span>
                      </div>

                      {/* Client / Title */}
                      <div className="flex items-center gap-1.5 mb-1">
                        {isBlocked ? (
                          <Lock className="w-4 h-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
                        ) : block.source === "online" ? (
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-sky-400" strokeWidth={1.5} />
                        ) : (
                          <UserPlus className="w-4 h-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
                        )}
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {isBlocked ? "Личное время" : block.clientName || "Без имени"}
                        </span>
                        {block.source === "online" && (
                          <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" title="Онлайн-запись" />
                        )}
                      </div>

                      {/* Service */}
                      {block.serviceName && (
                        <div className="text-xs text-slate-500 mb-1">{block.serviceName}</div>
                      )}

                      {/* Contact info */}
                      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                        {block.clientPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" strokeWidth={1.5} />
                            {block.clientPhone}
                          </div>
                        )}
                        {block.clientTg && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" strokeWidth={1.5} />
                            {block.clientTg}
                          </div>
                        )}
                        {block.price !== null && block.price > 0 && (
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            💰 {block.price.toLocaleString("ru-RU")} ₽
                          </div>
                        )}
                        {block.comment && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" strokeWidth={1.5} />
                            {block.comment}
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      {!isBlocked && (
                        <div className="mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            {STATUS_LABELS[block.status] || block.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingBlock(block);
                          setModal("edit");
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(isBlocked ? "Удалить блокировку?" : "Удалить запись?")) return;
                          try {
                            await deleteTimeBlock(block.id);
                            toast.success(isBlocked ? "Блокировка удалена" : "Запись удалена");
                            loadBlocks();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Ошибка удаления");
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {modal === "add" && (
        <AddEditModal
          mode="add"
          masterId={masterId}
          date={date}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            loadBlocks();
          }}
        />
      )}

      {/* Edit Modal */}
      {modal === "edit" && editingBlock && (
        <AddEditModal
          mode="edit"
          masterId={masterId}
          date={date}
          block={editingBlock}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            loadBlocks();
          }}
        />
      )}

      {/* Calendar Modal */}
      {modal === "calendar" && (
        <CalendarModal
          year={calYear}
          month={calMonth}
          selectedDate={date}
          monthBlocks={monthBlocks}
          onSelect={(d) => {
            setDate(d);
            router.push(`/master/diary?date=${d}`, { scroll: false });
            setModal(null);
          }}
          onChangeMonth={(y, m) => {
            setCalYear(y);
            setCalMonth(m);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ===== Add/Edit Modal =====

function AddEditModal({
  mode,
  masterId,
  date,
  block,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  masterId: string;
  date: string;
  block?: TimeBlock;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = mode === "edit";
  const isOnline = block?.source === "online";
  const isBlocked = block?.type === "blocked";

  const [startTime, setStartTime] = useState(block?.startTime || "10:00");
  const [endTime, setEndTime] = useState(block?.endTime || "10:30");
  const [duration, setDuration] = useState(30);
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [customDuration, setCustomDuration] = useState("");
  const [type, setType] = useState(block?.type || "booking");
  const [clientName, setClientName] = useState(block?.clientName || "");
  const [clientPhone, setClientPhone] = useState(block?.clientPhone || "");
  const [clientTg, setClientTg] = useState(block?.clientTg || "");
  const [serviceName, setServiceName] = useState(block?.serviceName || "");
  const [price, setPrice] = useState(block?.price?.toString() || "");
  const [comment, setComment] = useState(block?.comment || "");
  const [status, setStatus] = useState(block?.status || "confirmed");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit && !useCustomDuration) {
      setEndTime(addMinutes(startTime, duration));
    }
  }, [startTime, duration, isEdit, useCustomDuration]);

  useEffect(() => {
    if (useCustomDuration && customDuration) {
      const d = parseInt(customDuration, 10);
      if (!isNaN(d) && d > 0) {
        setEndTime(addMinutes(startTime, d));
      }
    }
  }, [customDuration, startTime, useCustomDuration]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEdit && block) {
        await updateTimeBlock(block.id, {
          startTime,
          endTime,
          serviceName: serviceName || undefined,
          comment: comment || undefined,
          status,
          price: price ? parseInt(price, 10) : undefined,
        });
        toast.success("Запись обновлена");
      } else {
        await createTimeBlock({
          masterId,
          date,
          startTime,
          endTime,
          type,
          clientName: type === "booking" ? clientName : undefined,
          clientPhone: type === "booking" ? clientPhone : undefined,
          clientTg: clientTg || undefined,
          serviceName: type === "booking" ? serviceName : undefined,
          comment: comment || undefined,
          price: price ? parseInt(price, 10) : undefined,
        });
        toast.success("Запись создана");
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:w-[480px] sm:max-h-[85vh] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-lg border border-slate-200/60">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="font-serif text-2xl font-300 text-slate-900 mb-6">
            {isEdit ? (isBlocked ? "Редактировать блокировку" : "Редактировать запись") : "Добавить запись"}
          </h2>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Начало</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Окончание</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                required
              />
            </div>
          </div>

          {/* Duration (add only) */}
          {!isEdit && (
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Длительность</label>
              <div className="flex gap-2 mb-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setUseCustomDuration(false); setDuration(d); }}
                    className={`flex-1 py-2 text-xs border transition-all ${
                      !useCustomDuration && duration === d
                        ? "border-sky-400 bg-sky-50 text-sky-600"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {d} мин
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setUseCustomDuration(true)}
                  className={`flex-1 py-2 text-xs border transition-all ${
                    useCustomDuration
                      ? "border-sky-400 bg-sky-50 text-sky-600"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  Своя
                </button>
              </div>
              {useCustomDuration && (
                <input
                  type="number"
                  placeholder="Минуты"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400"
                />
              )}
            </div>
          )}

          {/* Type (add only) */}
          {!isEdit && (
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Тип</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("booking")}
                  className={`flex-1 py-2 text-xs border transition-all ${
                    type === "booking"
                      ? "border-sky-400 bg-sky-50 text-sky-600"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  Запись клиента
                </button>
                <button
                  type="button"
                  onClick={() => setType("blocked")}
                  className={`flex-1 py-2 text-xs border transition-all ${
                    type === "blocked"
                      ? "border-slate-400 bg-slate-50 text-slate-600"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  Блокировка
                </button>
              </div>
            </div>
          )}

          {/* Booking fields */}
          {type === "booking" && !isBlocked && (
            <>
              <div className="mb-3">
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Имя клиента {isOnline && "(нельзя изменить)"}
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={isOnline}
                  required={type === "booking"}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20 disabled:opacity-50"
                  placeholder="Имя"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Телефон {isOnline && "(нельзя изменить)"}
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 11) {
                      let formatted = v;
                      if (v.length > 0 && !v.startsWith("7")) formatted = "7" + v;
                      setClientPhone("+" + formatted);
                    }
                  }}
                  disabled={isOnline}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20 disabled:opacity-50"
                  placeholder="+7"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Telegram</label>
                <input
                  type="text"
                  value={clientTg}
                  onChange={(e) => setClientTg(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                  placeholder="@username"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Услуга</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required={type === "booking"}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                  placeholder="Название услуги"
                />
              </div>
            </>
          )}

          {/* Price */}
          {type === "booking" && !isBlocked && (
            <div className="mb-3">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Стоимость, ₽</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                placeholder="1500"
              />
            </div>
          )}

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Комментарий</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20 resize-none"
              placeholder="Примечания..."
            />
          </div>

          {/* Status chips (edit booking only) */}
          {isEdit && !isBlocked && (
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Статус</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_CHIPS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(s.key)}
                    className={`px-3 py-1.5 text-xs border transition-all ${
                      status === s.key
                        ? "border-sky-400 bg-sky-50 text-sky-600"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-slate-900 text-white text-sm tracking-wide hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-700 text-sm tracking-wide hover:bg-slate-50 transition-colors"
            >
              Отмена
            </button>
          </div>

          {/* Delete blocked time */}
          {isEdit && isBlocked && block && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Удалить блокировку ${block.startTime}–${block.endTime}? Время станет свободным для записи.`)) return;
                  try {
                    await deleteTimeBlock(block.id);
                    toast.success("Блокировка удалена. Время свободно.");
                    onSuccess();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Ошибка удаления");
                  }
                }}
                className="w-full py-3 bg-red-50 border border-red-200 text-red-600 text-sm tracking-wide hover:bg-red-100 transition-colors"
              >
                🗑 Удалить блокировку
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ===== Calendar Modal =====

function CalendarModal({
  year,
  month,
  selectedDate,
  monthBlocks,
  onSelect,
  onChangeMonth,
  onClose,
}: {
  year: number;
  month: number;
  selectedDate: string;
  monthBlocks: Record<string, { hasBooking: boolean; hasBlocked: boolean }>;
  onSelect: (date: string) => void;
  onChangeMonth: (y: number, m: number) => void;
  onClose: () => void;
}) {
  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;

  const todayStr = new Date().toISOString().split("T")[0];

  function navigateMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    else if (newMonth < 1) { newMonth = 12; newYear--; }
    onChangeMonth(newYear, newMonth);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:w-[360px] bg-white/95 backdrop-blur-lg border border-slate-200/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-1 text-slate-500 hover:text-slate-900">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <span className="text-sm font-medium text-slate-900">
            {monthNames[month - 1]} {year}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-1 text-slate-500 hover:text-slate-900">
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-[10px] py-1 text-slate-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: adjustedFirst }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const blocks = monthBlocks[dateStr];

            return (
              <button
                key={day}
                onClick={() => onSelect(dateStr)}
                className={`aspect-square flex flex-col items-center justify-center gap-0.5 transition-all ${
                  isSelected
                    ? "bg-sky-50 border border-sky-400 text-sky-600"
                    : isToday
                    ? "border border-sky-400 text-slate-900"
                    : "border border-transparent text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-sm">{day}</span>
                {blocks?.hasBooking && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                {!blocks?.hasBooking && blocks?.hasBlocked && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
