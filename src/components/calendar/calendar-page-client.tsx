"use client";

import { useState, useMemo, useCallback } from "react";
import { CalendarPlus, CalendarDays } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import MiniCalendar from "./mini-calendar";
import EventTypeFilter from "./event-type-filter";
import EventCard from "./event-card";
import EventForm from "./event-form";
import { deleteEvent, getMonthEvents, type CalendarEvent } from "@/app/actions/calendar";

interface CalendarPageClientProps {
  initialEvents: CalendarEvent[];
  initialYear: number;
  initialMonth: number;
  clients: { id: string; name: string }[];
}

export default function CalendarPageClient({
  initialEvents,
  initialYear,
  initialMonth,
  clients,
}: CalendarPageClientProps) {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    new Set(["call", "payment", "reminder", "interest", "meeting"])
  );
  const [showEventForm, setShowEventForm] = useState(false);

  // Fetch events when month changes
  const handleMonthChange = useCallback(async (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    const data = await getMonthEvents(newYear, newMonth);
    setEvents(data);
  }, []);

  // Filter events for selected date + active types
  const dayEvents = useMemo(() => {
    return events
      .filter((e) => e.date === selectedDate && activeTypes.has(e.type))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDate, activeTypes]);

  function toggleType(type: string) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  async function handleDeleteEvent(eventId: string) {
    const result = await deleteEvent(eventId);
    if (result.success) {
      toast("Událost smazána");
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } else {
      toast(result.error || "Nepodařilo se smazat událost", "error");
    }
  }

  async function handleEventCreated() {
    const data = await getMonthEvents(year, month);
    setEvents(data);
  }

  // Format selected date for display
  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = selectedDateObj.toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text">
            Kalendář
          </h1>
          <p className="mt-0.5 text-sm text-text-mid">
            {events.length} událostí tento měsíc
          </p>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <CalendarPlus size={16} />
          <span className="hidden sm:inline">Přidat událost</span>
        </button>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left panel: calendar + filters */}
        <div className="lg:w-[280px] shrink-0 space-y-4">
          <div className="bg-surface rounded-[16px] border border-border shadow-card p-4">
            <MiniCalendar
              year={year}
              month={month}
              selectedDate={selectedDate}
              events={events}
              onDateSelect={setSelectedDate}
              onMonthChange={handleMonthChange}
            />
          </div>

          <div className="bg-surface rounded-[16px] border border-border shadow-card p-4 lg:p-3">
            <EventTypeFilter
              events={events}
              activeTypes={activeTypes}
              onToggle={toggleType}
            />
          </div>
        </div>

        {/* Right panel: events for selected day */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-text capitalize">
              {formattedDate}
            </h2>
            <span className="text-xs text-text-dim">
              {dayEvents.length}{" "}
              {dayEvents.length === 1 ? "událost" : dayEvents.length < 5 ? "události" : "událostí"}
            </span>
          </div>

          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <CalendarDays size={24} className="text-gold" />
              </div>
              <h3 className="font-display text-base font-semibold text-text mb-1">
                Žádné události
              </h3>
              <p className="text-sm text-text-dim mb-4">
                Pro tento den nejsou naplánovány žádné události
              </p>
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
              >
                <CalendarPlus size={16} />
                Přidat událost
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isPast={event.date < today}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EventForm */}
      <EventForm
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSuccess={handleEventCreated}
        defaultDate={selectedDate}
        clients={clients}
      />
    </div>
  );
}
