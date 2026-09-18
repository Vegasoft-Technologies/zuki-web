"use client";

import { useEffect, useState } from "react";
import { formatRange, openingHours } from "@/data/openingHours";
import { getLondonDayIndex } from "@/lib/openingStatus";

/**
 * The opening hours, with today's row marked. Which day it is depends on the clock, so
 * the highlight is added after mount for the same reason the status line is.
 */
export default function OpeningHoursTable() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setToday(getLondonDayIndex(new Date())));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <table className="hours" id="hours">
      <tbody>
        {openingHours.map((day) => (
          <tr
            key={day.label}
            data-day={day.day}
            className={day.day === today ? "is-today" : undefined}
          >
            <th>{day.label}</th>
            <td>{formatRange(day)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
