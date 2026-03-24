"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";
import type { CalendarEvent } from "@/app/actions/calendar";
import type { EventType } from "@/lib/types";

const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

interface MiniCalendarProps {
  year: number;
  month: number;
  selectedDate: string;
  events: CalendarEvent[];
  onDateSelect: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

export default function MiniCalendar({
  year,
  month,
  selectedDate,
  events,
  onDateSelect,
  onMonthChange,
}: MiniCalendarProps) {
  const today = new Date().toISOString().split("T")[0];

  // Build event dots map: date -> set of event types
  const eventDots = new Map<string, Set<string>>();
  for (const e of events) {
    if (!eventDots.has(e.date)) eventDots.set(e.date, new Set());
    eventDots.get(e.date)!.add(e.type);
  }

  // Calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0, Sunday = 6 (Czech standard)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthNames = [
    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
    "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
  ];

  function prevMonth() {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  }

  function nextMonth() {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  }

  function formatDate(day: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-[8px] text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-sm font-bold text-text">
          {monthNames[month - 1]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-[8px] text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-text-dim uppercase tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const dateStr = formatDate(day);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dots = eventDots.get(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-[36px] min-h-[44px] sm:min-h-[36px] rounded-[8px] text-sm transition-all",
                isToday && !isSelected &&
                  "bg-gradient-to-br from-gold to-gold-light text-white font-bold",
                isSelected && "ring-2 ring-gold ring-offset-1 font-bold text-gold",
                !isToday && !isSelected && "text-text hover:bg-surface-hover"
              )}
            >
              {day}
              {/* Event dots */}
              {dots && dots.size > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from(dots)
                    .slice(0, 3)
                    .map((type) => (
                      <span
                        key={type}
                        className="w-1 h-1 rounded-full"
                        style={{
                          backgroundColor:
                            EVENT_TYPES[type as EventType]?.color || "#8892aa",
                        }}
                      />
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
