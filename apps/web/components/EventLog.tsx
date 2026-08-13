"use client";

import type { DuelEvent } from "@duelo/shared";
import { useEffect, useRef } from "react";
import { formatEvent } from "../lib/format-event";

export function EventLog({ events }: { events: DuelEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [events.length]);

  return (
    <section className="flex h-[40vh] flex-col border-b border-white/10 xl:h-[55vh]" data-testid="event-log">
      <h2 className="px-4 py-3 text-sm font-semibold uppercase tracking-wider text-stone-400">Log</h2>
      <div ref={ref} className="flex-1 space-y-1 overflow-auto px-4 pb-4 text-sm text-stone-200">
        {events.map((event) => (
          <p key={event.eventId} data-testid="log-line">
            {formatEvent(event)}
          </p>
        ))}
      </div>
    </section>
  );
}
