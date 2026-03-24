"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Phone,
  Check,
  Clock,
  AlertTriangle,
  Copy,
  CheckCheck,
  Sunrise,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markTaskDone } from "@/app/actions/my-day";
import type { DayTask, FollowUp } from "@/app/actions/my-day";

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  call: { icon: "phone", color: "text-sapphire" },
  payment: { icon: "payment", color: "text-emerald" },
  reminder: { icon: "reminder", color: "text-amber" },
  meeting: { icon: "meeting", color: "text-gold" },
};

const TYPE_LABELS: Record<string, string> = {
  call: "Hovor",
  payment: "Platba",
  reminder: "Připomínka",
  meeting: "Schůzka",
};

const STORAGE_KEY = "myday-done";

function loadDoneIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().split("T")[0];
    if (parsed.date !== today) return new Set();
    return new Set(parsed.ids as string[]);
  } catch {
    return new Set();
  }
}

function saveDoneIds(ids: string[]) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids }));
}

interface Props {
  tasks: DayTask[];
  followUps: FollowUp[];
  isCompanyView: boolean;
}

export default function MyDay({ tasks: initialTasks, followUps, isCompanyView }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Hydrate done state from localStorage
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const doneIds = loadDoneIds();
    if (doneIds.size > 0) {
      setTasks((prev) =>
        prev.map((t) => (doneIds.has(t.id) ? { ...t, done: true } : t))
      );
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist done state to localStorage
  useEffect(() => {
    const doneIds = tasks.filter((t) => t.done).map((t) => t.id);
    saveDoneIds(doneIds);
  }, [tasks]);

  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  function handleToggle(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.done) {
      // Mark as done — show note prompt
      setNoteFor(taskId);
      setNoteText("");
    } else {
      // Unmark
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: false } : t)));
    }
  }

  function submitNote() {
    if (!noteFor) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === noteFor ? { ...t, done: true } : t))
    );
    startTransition(async () => {
      await markTaskDone(noteFor, noteText || undefined);
    });
    setNoteFor(null);
    setNoteText("");
  }

  function skipNote() {
    if (!noteFor) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === noteFor ? { ...t, done: true } : t))
    );
    startTransition(async () => {
      await markTaskDone(noteFor);
    });
    setNoteFor(null);
  }

  async function copyPhone(phone: string, id: string) {
    await navigator.clipboard.writeText(phone);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (totalCount === 0 && followUps.length === 0) return null;

  return (
    <div className="bg-surface rounded-[16px] border border-border p-4 md:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-[10px] bg-gold-pale flex items-center justify-center">
          <Sunrise size={18} className="text-gold" />
        </div>
        <div>
          <h2 className="font-display text-base md:text-lg font-bold text-text">
            {isCompanyView ? "Dnes ve firme" : "Muj den"}
          </h2>
          {totalCount > 0 && (
            <p className="text-xs text-text-mid">
              {doneCount} z {totalCount} splneno
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-2 bg-border rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-1 mb-4">
          {tasks.map((task) => {
            const typeInfo = TYPE_ICONS[task.type] || TYPE_ICONS.call;
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-[10px] transition-all",
                  task.done
                    ? "bg-emerald-pale opacity-70"
                    : "bg-surface-hover hover:bg-border/30"
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task.id)}
                  className={cn(
                    "w-[44px] h-[44px] md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    task.done
                      ? "bg-emerald border-emerald text-white"
                      : "border-border-dark hover:border-gold"
                  )}
                >
                  {task.done && <Check size={14} />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                        typeInfo.color,
                        task.type === "call" && "bg-sapphire-pale",
                        task.type === "payment" && "bg-emerald-pale",
                        task.type === "reminder" && "bg-amber-pale",
                        task.type === "meeting" && "bg-gold-pale"
                      )}
                    >
                      {TYPE_LABELS[task.type]}
                    </span>
                    <span className="text-xs text-text-dim">{task.time}</span>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium text-text truncate mt-0.5",
                      task.done && "line-through text-text-dim"
                    )}
                  >
                    {task.title}
                  </p>
                  {task.clientName && (
                    <p className="text-xs text-text-mid truncate">
                      {task.clientName}
                    </p>
                  )}
                </div>

                {/* Phone action */}
                {task.clientPhone && (
                  <>
                    {/* Mobile: tel: link */}
                    <a
                      href={`tel:${task.clientPhone}`}
                      className="md:hidden w-[44px] h-[44px] flex items-center justify-center rounded-[8px] bg-sapphire-pale text-sapphire shrink-0"
                      aria-label="Zavolat"
                    >
                      <Phone size={16} />
                    </a>
                    {/* Desktop: copy */}
                    <button
                      onClick={() => copyPhone(task.clientPhone!, task.id)}
                      className="hidden md:flex w-8 h-8 items-center justify-center rounded-[8px] hover:bg-sapphire-pale text-text-dim hover:text-sapphire transition-colors shrink-0"
                      title={task.clientPhone}
                    >
                      {copied === task.id ? (
                        <CheckCheck size={14} className="text-emerald" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Follow-ups */}
      {followUps.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-amber" />
            <h3 className="text-sm font-medium text-text">Follow-upy</h3>
          </div>
          <div className="space-y-1">
            {followUps.map((fu) => (
              <div
                key={fu.id}
                className="flex items-center gap-3 p-3 rounded-[10px] bg-amber-pale/50"
              >
                <Clock size={16} className="text-amber shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {fu.name}
                  </p>
                  <p className="text-xs text-text-mid">
                    {fu.daysOverdue === 0
                      ? "Platba dnes"
                      : `Zpozdeni ${fu.daysOverdue} ${fu.daysOverdue === 1 ? "den" : fu.daysOverdue < 5 ? "dny" : "dni"}`}
                  </p>
                </div>
                {/* Phone */}
                <a
                  href={`tel:${fu.phone}`}
                  className="md:hidden w-[44px] h-[44px] flex items-center justify-center rounded-[8px] bg-sapphire-pale text-sapphire shrink-0"
                  aria-label="Zavolat"
                >
                  <Phone size={16} />
                </a>
                <button
                  onClick={() => copyPhone(fu.phone, fu.id)}
                  className="hidden md:flex w-8 h-8 items-center justify-center rounded-[8px] hover:bg-sapphire-pale text-text-dim hover:text-sapphire transition-colors shrink-0"
                  title={fu.phone}
                >
                  {copied === fu.id ? (
                    <CheckCheck size={14} className="text-emerald" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Note popup */}
      {noteFor && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={skipNote}
          />
          <div className="relative bg-surface rounded-[16px] border border-border shadow-lg w-full max-w-sm p-5 animate-fade-in">
            <h3 className="font-display text-base font-bold text-text mb-2">
              Jak to dopadlo?
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Kratka poznamka (nepovinne)..."
              className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-surface-hover text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none transition-colors"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={skipNote}
                className="flex-1 px-4 py-2.5 min-h-[44px] rounded-[10px] border border-border text-sm font-medium text-text-mid hover:bg-surface-hover transition-colors"
              >
                Preskocit
              </button>
              <button
                onClick={submitNote}
                className="flex-1 px-4 py-2.5 min-h-[44px] rounded-[10px] bg-gold text-white text-sm font-medium hover:bg-gold-light transition-colors"
                disabled={isPending}
              >
                Ulozit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
