"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getMasterDayBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  logoutMaster,
} from "../actions";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  CheckCircle2,
  UserPlus,
  Check,
  X,
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

function getBlockColors(block: TimeBlock) {
  if (block.status === "cancelled" || block.status === "no-show") {
    return {
      bg: "rgba(255,107,129,0.06)",
      border: "#FF6B81",
      glow: "none",
      icon: X,
      text: "#FF6B81",
    };
  }
  if (block.status === "completed") {
    return {
      bg: "rgba(165,216,255,0.1)",
      border: "#A5D8FF",
      glow: "none",
      icon: Check,
      text: "#4F8CFF",
    };
  }
  if (block.source === "online") {
    return {
      bg: "rgba(79,140,255,0.08)",
      border: "#4F8CFF",
      glow: "0 0 20px rgba(79,140,255,0.2)",
      icon: CheckCircle2,
      text: "#4F8CFF",
    };
  }
  if (block.type === "blocked") {
    return {
      bg: "rgba(107,123,156,0.04)",
      border: "#6B7B9C",
      glow: "none",
      icon: Lock,
      text: "#6B7B9C",
    };
  }
  return {
    bg: "rgba(107,123,156,0.06)",
    border: "#6B7B9C",
    glow: "none",
    icon: UserPlus,
    text: "#1A1F36",
  };
}

export default function MasterDiaryClient({
  masterId,
  masterName,
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

  // Calendar month state
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
      const { getMasterBlocksForMonth } = await import("../actions");
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
    return { bookings: bookings.length, completed };
  }, [blocks]);

  // Generate timeline slots (hour marks + blocks)
  const timelineItems = useMemo(() => {
    const items: Array<{ kind: "block"; block: TimeBlock } | { kind: "empty"; start: string; end: string }> = [];

    const startMin = parseTime(startTime);
    const endMin = parseTime(endTime);

    // Add blocks sorted by startTime
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
    <div className="min-h-screen" style={{ background: "#F0F4F8" }}>
      {/* Header */}
      <header
        style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}
        className="border-b sticky top-0 z-30"
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-300" style={{ color: "#1A1F36", fontFamily: "'Cormorant Garamond', serif" }}>
            BeautyBook
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:inline" style={{ color: "#6B7B9C" }}>{masterName}</span>
            <form action={logoutMaster}>
              <button type="submit" className="text-sm transition-colors" style={{ color: "#6B7B9C" }}>
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }} className="border-b sticky top-14 z-20">
        <div className="max-w-3xl mx-auto px-4 flex gap-6">
          <Link href="/master/dashboard" className="py-3 text-sm transition-colors" style={{ color: "#6B7B9C" }}>
            Записи
          </Link>
          <Link href="/master/schedule" className="py-3 text-sm transition-colors" style={{ color: "#6B7B9C" }}>
            График
          </Link>
          <Link
            href="/master/diary"
            className="py-3 text-sm border-b-2 transition-colors"
            style={{ color: "#1A1F36", borderColor: "#4F8CFF" }}
          >
            Дневник
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        {/* Day Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateDay(-1)}
            className="p-2 rounded-lg transition-colors hover:bg-white/50"
            style={{ color: "#6B7B9C" }}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/50"
              style={{ borderColor: "rgba(99,130,255,0.15)", color: "#6B7B9C" }}
            >
              Сегодня
            </button>
            <h1
              className="text-lg font-300"
              style={{ color: "#1A1F36", fontFamily: "'Cormorant Garamond', serif" }}
            >
              {formatDateRu(date)}
            </h1>
          </div>

          <button
            onClick={() => navigateDay(1)}
            className="p-2 rounded-lg transition-colors hover:bg-white/50"
            style={{ color: "#6B7B9C" }}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Micro Stats */}
        <div className="flex gap-4 mb-6">
          <div
            className="flex-1 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(99,130,255,0.15)" }}
          >
            <div className="text-lg font-semibold tabular-nums" style={{ color: "#1A1F36" }}>
              {stats.bookings}
            </div>
            <div className="text-xs" style={{ color: "#6B7B9C" }}>Записи</div>
          </div>
          <div
            className="flex-1 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(99,130,255,0.15)" }}
          >
            <div className="text-lg font-semibold tabular-nums" style={{ color: "#1A1F36" }}>
              {stats.completed}
            </div>
            <div className="text-xs" style={{ color: "#6B7B9C" }}>Завершено</div>
          </div>
          <button
            onClick={() => setModal("calendar")}
            className="flex-1 px-4 py-3 rounded-xl flex flex-col items-center justify-center transition-colors hover:bg-white/80"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(99,130,255,0.15)" }}
          >
            <CalendarDays className="w-5 h-5 mb-1" strokeWidth={1.5} style={{ color: "#4F8CFF" }} />
            <div className="text-xs" style={{ color: "#6B7B9C" }}>Календарь</div>
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
            setEditingBlock(null);
            setModal("add");
          }}
          className="w-full mb-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md"
          style={{
            background: "rgba(79,140,255,0.08)",
            border: "1px solid #4F8CFF",
            color: "#4F8CFF",
          }}
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-medium">Добавить запись</span>
        </button>

        {/* Timeline */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-sm" style={{ color: "#6B7B9C" }}>
              Загрузка...
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-sm mb-4" style={{ color: "#6B7B9C" }}>
                Нет записей на этот день
              </div>
              <button
                onClick={() => setModal("add")}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ background: "rgba(79,140,255,0.08)", color: "#4F8CFF", border: "1px solid #4F8CFF" }}
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
                    className="w-full py-2 rounded-xl flex items-center justify-center gap-1 transition-colors hover:bg-white/50"
                    style={{
                      background: "rgba(255,255,255,0.4)",
                      border: "1px dashed rgba(99,130,255,0.2)",
                      color: "#6B7B9C",
                    }}
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-xs">
                      {item.start} – {item.end}
                    </span>
                  </button>
                );
              }

              const block = item.block;
              const colors = getBlockColors(block);
              const Icon = colors.icon;
              const duration = parseTime(block.endTime) - parseTime(block.startTime);

              return (
                <div
                  key={block.id}
                  className="relative rounded-xl overflow-hidden transition-all hover:shadow-lg"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    boxShadow: colors.glow,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {/* Left indicator */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ background: colors.border }}
                  />

                  <div className="pl-4 pr-3 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Time */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-semibold tabular-nums" style={{ color: "#1A1F36" }}>
                            {block.startTime}
                          </span>
                          <span className="text-xs" style={{ color: "#6B7B9C" }}>
                            – {block.endTime}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(107,123,156,0.1)", color: "#6B7B9C" }}>
                            {duration} мин
                          </span>
                        </div>

                        {/* Client / Title */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} style={{ color: colors.text }} />
                          <span className="text-sm font-medium truncate" style={{ color: "#1A1F36" }}>
                            {block.type === "blocked"
                              ? "Личное время"
                              : block.clientName || "Без имени"}
                          </span>
                          {block.source === "online" && (
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: "#4F8CFF" }}
                              title="Онлайн-запись"
                            />
                          )}
                        </div>

                        {/* Service */}
                        {block.serviceName && (
                          <div className="text-xs mb-1" style={{ color: "#6B7B9C" }}>
                            {block.serviceName}
                          </div>
                        )}

                        {/* Contact info */}
                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#6B7B9C" }}>
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
                          {block.comment && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" strokeWidth={1.5} />
                              {block.comment}
                            </div>
                          )}
                        </div>

                        {/* Status */}
                        <div className="mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: "#6B7B9C" }}>
                            {STATUS_LABELS[block.status] || block.status}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => {
                            setEditingBlock(block);
                            setModal("edit");
                          }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/50"
                          style={{ color: "#6B7B9C" }}
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Удалить запись?")) return;
                            try {
                              await deleteTimeBlock(block.id);
                              toast.success("Запись удалена");
                              loadBlocks();
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Ошибка удаления");
                            }
                          }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                          style={{ color: "#FF6B81" }}
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
      </main>

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
      <div
        className="relative w-full sm:w-[480px] sm:max-h-[85vh] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <h2
            className="text-xl font-300 mb-5"
            style={{ color: "#1A1F36", fontFamily: "'Cormorant Garamond', serif" }}
          >
            {isEdit ? "Редактировать запись" : "Добавить запись"}
          </h2>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Начало
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: "rgba(240,244,248,0.8)",
                  border: "1px solid rgba(99,130,255,0.15)",
                  color: "#1A1F36",
                }}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Окончание
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: "rgba(240,244,248,0.8)",
                  border: "1px solid rgba(99,130,255,0.15)",
                  color: "#1A1F36",
                }}
                required
              />
            </div>
          </div>

          {/* Duration buttons (only in add mode) */}
          {!isEdit && (
            <div className="mb-4">
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Длительность
              </label>
              <div className="flex gap-2 mb-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setUseCustomDuration(false);
                      setDuration(d);
                    }}
                    className="flex-1 py-2 text-xs rounded-lg border transition-all"
                    style={{
                      borderColor: !useCustomDuration && duration === d ? "#4F8CFF" : "rgba(99,130,255,0.15)",
                      background: !useCustomDuration && duration === d ? "rgba(79,140,255,0.08)" : "transparent",
                      color: !useCustomDuration && duration === d ? "#4F8CFF" : "#6B7B9C",
                    }}
                  >
                    {d} мин
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setUseCustomDuration(true)}
                  className="flex-1 py-2 text-xs rounded-lg border transition-all"
                  style={{
                    borderColor: useCustomDuration ? "#4F8CFF" : "rgba(99,130,255,0.15)",
                    background: useCustomDuration ? "rgba(79,140,255,0.08)" : "transparent",
                    color: useCustomDuration ? "#4F8CFF" : "#6B7B9C",
                  }}
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
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: "rgba(240,244,248,0.8)",
                    border: "1px solid rgba(99,130,255,0.15)",
                    color: "#1A1F36",
                  }}
                />
              )}
            </div>
          )}

          {/* Type */}
          {!isEdit && (
            <div className="mb-4">
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Тип
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("booking")}
                  className="flex-1 py-2 text-xs rounded-lg border transition-all"
                  style={{
                    borderColor: type === "booking" ? "#4F8CFF" : "rgba(99,130,255,0.15)",
                    background: type === "booking" ? "rgba(79,140,255,0.08)" : "transparent",
                    color: type === "booking" ? "#4F8CFF" : "#6B7B9C",
                  }}
                >
                  Запись клиента
                </button>
                <button
                  type="button"
                  onClick={() => setType("blocked")}
                  className="flex-1 py-2 text-xs rounded-lg border transition-all"
                  style={{
                    borderColor: type === "blocked" ? "#6B7B9C" : "rgba(99,130,255,0.15)",
                    background: type === "blocked" ? "rgba(107,123,156,0.08)" : "transparent",
                    color: type === "blocked" ? "#6B7B9C" : "#6B7B9C",
                  }}
                >
                  Блокировка
                </button>
              </div>
            </div>
          )}

          {/* Client Name */}
          {type === "booking" && (
            <div className="mb-3">
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Имя клиента {isOnline && "(нельзя изменить)"}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={isOnline}
                required={type === "booking"}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors disabled:opacity-50"
                style={{
                  background: "rgba(240,244,248,0.8)",
                  border: "1px solid rgba(99,130,255,0.15)",
                  color: "#1A1F36",
                }}
                placeholder="Имя"
              />
            </div>
          )}

          {/* Phone */}
          {type === "booking" && (
            <div className="mb-3">
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Телефон {isOnline && "(нельзя изменить)"}
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  if (v.length <= 11) {
                    let formatted = v;
                    if (v.length > 0 && !v.startsWith("7")) {
                      formatted = "7" + v;
                    }
                    setClientPhone("+" + formatted);
                  }
                }}
                disabled={isOnline}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors disabled:opacity-50"
                style={{
                  background: "rgba(240,244,248,0.8)",
                  border: "1px solid rgba(99,130,255,0.15)",
                  color: "#1A1F36",
                }}
                placeholder="+7"
              />
            </div>
          )}

          {/* Telegram */}
          {type === "booking" && (
            <div className="mb-3">
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Telegram
              </label>
              <input
                type="text"
                value={clientTg}
                onChange={(e) => setClientTg(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "rgba(240,244,248,0.8)",
                  border: "1px solid rgba(99,130,255,0.15)",
                  color: "#1A1F36",
                }}
                placeholder="@username"
              />
            </div>
          )}

          {/* Service */}
          {type === "booking" && (
            <div className="mb-3">
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Услуга
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required={type === "booking"}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "rgba(240,244,248,0.8)",
                  border: "1px solid rgba(99,130,255,0.15)",
                  color: "#1A1F36",
                }}
                placeholder="Название услуги"
              />
            </div>
          )}

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
              Комментарий
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{
                background: "rgba(240,244,248,0.8)",
                border: "1px solid rgba(99,130,255,0.15)",
                color: "#1A1F36",
              }}
              placeholder="Примечания..."
            />
          </div>

          {/* Status chips (edit only) */}
          {isEdit && (
            <div className="mb-4">
              <label className="block text-xs mb-1.5" style={{ color: "#6B7B9C" }}>
                Статус
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_CHIPS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(s.key)}
                    className="px-3 py-1.5 text-xs rounded-lg border transition-all"
                    style={{
                      borderColor: status === s.key ? "#4F8CFF" : "rgba(99,130,255,0.15)",
                      background: status === s.key ? "rgba(79,140,255,0.08)" : "transparent",
                      color: status === s.key ? "#4F8CFF" : "#6B7B9C",
                    }}
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
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{
                background: "#1A1F36",
                color: "#fff",
              }}
            >
              {saving ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm transition-all"
              style={{
                background: "rgba(240,244,248,0.8)",
                color: "#6B7B9C",
                border: "1px solid rgba(99,130,255,0.15)",
              }}
            >
              Отмена
            </button>
          </div>
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
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    onChangeMonth(newYear, newMonth);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative w-full sm:w-[360px] rounded-t-2xl sm:rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-1" style={{ color: "#6B7B9C" }}>
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <span className="text-sm font-medium" style={{ color: "#1A1F36" }}>
            {monthNames[month - 1]} {year}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-1" style={{ color: "#6B7B9C" }}>
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-[10px] py-1" style={{ color: "#6B7B9C" }}>
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
                className="aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all"
                style={{
                  background: isSelected ? "rgba(79,140,255,0.12)" : "transparent",
                  border: isToday ? "1px solid #4F8CFF" : isSelected ? "1px solid rgba(79,140,255,0.3)" : "1px solid transparent",
                  color: isSelected ? "#4F8CFF" : "#1A1F36",
                }}
              >
                <span className="text-sm">{day}</span>
                {blocks?.hasBooking && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4F8CFF" }} />
                )}
                {!blocks?.hasBooking && blocks?.hasBlocked && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#6B7B9C" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
