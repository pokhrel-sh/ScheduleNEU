import { useMemo } from 'react';
import type { SectionDisplay } from '../../types';
import { parseTime, expandDays } from '../../utils/timeUtils';
import CalendarBlock from './CalendarBlock';

const DAYS = ['M', 'T', 'W', 'R', 'F'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 48;

interface CalendarEntry {
  section: SectionDisplay;
  courseLabel: string;
  colorIndex: number;
  day: string;
  startMinutes: number;
  endMinutes: number;
}

interface WeeklyCalendarProps {
  sections: SectionDisplay[];
  courseMap?: Map<string, { label: string; colorIndex: number }>;
}

export default function WeeklyCalendar({ sections, courseMap }: WeeklyCalendarProps) {
  const entries = useMemo<CalendarEntry[]>(() => {
    const result: CalendarEntry[] = [];
    sections.forEach((section, sIdx) => {
      const days = expandDays(section.days);
      const startMinutes = parseTime(section.start_time);
      const endMinutes = parseTime(section.end_time);
      if (!startMinutes && !endMinutes) return;

      const mapEntry = courseMap?.get(section.crn);
      const label = mapEntry?.label || `Section ${section.crn}`;
      const colorIndex = mapEntry?.colorIndex ?? sIdx;

      for (const day of days) {
        result.push({ section, courseLabel: label, colorIndex, day, startMinutes, endMinutes });
      }
    });
    return result;
  }, [sections, courseMap]);

  const hours: number[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    hours.push(h);
  }

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  function minutesToPx(minutes: number): number {
    return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-gray-200">
        <div className="h-10" />
        {DAY_LABELS.map((label, i) => (
          <div
            key={DAYS[i]}
            className="h-10 flex items-center justify-center text-sm font-semibold text-gray-700 border-l border-gray-200"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(5,1fr)] relative" style={{ height: totalHeight }}>
        {/* Time labels */}
        <div className="relative">
          {hours.map((h) => (
            <div
              key={h}
              className="absolute w-full text-right pr-2 text-xs text-gray-400 -translate-y-1/2"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            >
              {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS.map((day) => (
          <div key={day} className="relative border-l border-gray-200">
            {/* Hour lines */}
            {hours.map((h) => (
              <div
                key={h}
                className="absolute w-full border-t border-gray-100"
                style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
              />
            ))}

            {/* Course blocks */}
            {entries
              .filter((e) => e.day === day)
              .map((entry, i) => {
                const top = minutesToPx(entry.startMinutes);
                const height = minutesToPx(entry.endMinutes) - top;
                return (
                  <CalendarBlock
                    key={`${entry.section.crn}-${day}-${i}`}
                    section={entry.section}
                    courseLabel={entry.courseLabel}
                    colorIndex={entry.colorIndex}
                    top={top}
                    height={Math.max(height, 20)}
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
