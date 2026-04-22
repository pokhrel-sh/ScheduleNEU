import { useMemo } from 'react';
import type { SectionDisplay } from '../../types';
import { parseTime, expandDays } from '../../utils/timeUtils';
import CalendarBlock from './CalendarBlock';

const DAYS = ['M', 'T', 'W', 'R', 'F'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 56;

interface CalendarEntry {
  section: SectionDisplay;
  courseLabel: string;
  colorIndex: number;
  day: string;
  startMinutes: number;
  endMinutes: number;
}

interface LayoutEntry extends CalendarEntry {
  column: number;
  totalColumns: number;
}

interface WeeklyCalendarProps {
  sections: SectionDisplay[];
  courseMap?: Map<string, { label: string; colorIndex: number }>;
}

/**
 * Given a list of entries for a single day, compute overlap groups
 * and assign each entry a column index and total column count,
 * so overlapping blocks appear side-by-side (like Outlook).
 */
function layoutOverlaps(dayEntries: CalendarEntry[]): LayoutEntry[] {
  if (dayEntries.length === 0) return [];

  // Sort by start time, then by end time descending (longer events first)
  const sorted = [...dayEntries].sort((a, b) =>
    a.startMinutes !== b.startMinutes
      ? a.startMinutes - b.startMinutes
      : b.endMinutes - a.endMinutes
  );

  // Group overlapping entries into clusters
  const clusters: CalendarEntry[][] = [];
  let currentCluster: CalendarEntry[] = [sorted[0]];
  let clusterEnd = sorted[0].endMinutes;

  for (let i = 1; i < sorted.length; i++) {
    const entry = sorted[i];
    if (entry.startMinutes < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(entry);
      clusterEnd = Math.max(clusterEnd, entry.endMinutes);
    } else {
      // No overlap — start a new cluster
      clusters.push(currentCluster);
      currentCluster = [entry];
      clusterEnd = entry.endMinutes;
    }
  }
  clusters.push(currentCluster);

  // For each cluster, assign columns greedily
  const result: LayoutEntry[] = [];

  for (const cluster of clusters) {
    // columns[i] = end time of the last event placed in column i
    const columns: number[] = [];

    for (const entry of cluster) {
      // Find the first column where this entry fits (doesn't overlap)
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        if (entry.startMinutes >= columns[col]) {
          columns[col] = entry.endMinutes;
          result.push({ ...entry, column: col, totalColumns: 0 }); // totalColumns set later
          placed = true;
          break;
        }
      }
      if (!placed) {
        const col = columns.length;
        columns.push(entry.endMinutes);
        result.push({ ...entry, column: col, totalColumns: 0 });
      }
    }

    // Set totalColumns for all entries in this cluster
    const totalCols = columns.length;
    // The entries we just pushed for this cluster are the last cluster.length items
    for (let i = result.length - cluster.length; i < result.length; i++) {
      result[i].totalColumns = totalCols;
    }
  }

  return result;
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

  // Pre-compute layout for each day
  const layoutByDay = useMemo(() => {
    const map = new Map<string, LayoutEntry[]>();
    for (const day of DAYS) {
      const dayEntries = entries.filter((e) => e.day === day);
      map.set(day, layoutOverlaps(dayEntries));
    }
    return map;
  }, [entries]);

  const hours: number[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    hours.push(h);
  }

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  function minutesToPx(minutes: number): number {
    return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[50px_repeat(5,1fr)] sm:grid-cols-[60px_repeat(5,1fr)] border-b border-gray-200">
        <div className="h-12" />
        {DAY_LABELS.map((label, i) => (
          <div
            key={DAYS[i]}
            className="h-12 flex items-center justify-center text-sm font-semibold text-gray-700 border-l border-gray-200"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{DAYS[i]}</span>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[50px_repeat(5,1fr)] sm:grid-cols-[60px_repeat(5,1fr)] relative overflow-x-auto" style={{ height: totalHeight }}>
        {/* Time labels */}
        <div className="relative">
          {hours.map((h) => (
            <div
              key={h}
              className="absolute w-full text-right pr-1 sm:pr-2 text-[10px] sm:text-xs text-gray-400 -translate-y-1/2"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            >
              {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS.map((day) => {
          const dayLayout = layoutByDay.get(day) || [];
          return (
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
              {dayLayout.map((entry, i) => {
                const top = minutesToPx(entry.startMinutes);
                const height = minutesToPx(entry.endMinutes) - top;
                const widthPercent = 100 / entry.totalColumns;
                const leftPercent = entry.column * widthPercent;

                return (
                  <CalendarBlock
                    key={`${entry.section.crn}-${day}-${i}`}
                    section={entry.section}
                    courseLabel={entry.courseLabel}
                    colorIndex={entry.colorIndex}
                    top={top}
                    height={Math.max(height, 20)}
                    leftPercent={leftPercent}
                    widthPercent={widthPercent}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
