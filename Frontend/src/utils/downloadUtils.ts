import type { SectionDisplay } from '../types';
import { expandDays, parseTime } from './timeUtils';

export async function downloadCalendarImage(elementId: string, filename: string = 'schedule.png') {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch {
    // html2canvas not available, use a fallback
    alert('Image export requires html2canvas. Install it with: npm install html2canvas');
  }
}

const ICS_DAY_MAP: Record<string, string> = {
  M: 'MO',
  T: 'TU',
  W: 'WE',
  R: 'TH',
  F: 'FR',
  S: 'SA',
  U: 'SU',
};

function formatICSTime(timeStr: string): string {
  const minutes = parseTime(timeStr);
  if (!minutes) return '000000';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
}

function getNextWeekday(start: Date, targetDay: number): Date {
  const d = new Date(start);
  while (d.getDay() !== targetDay) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

const JS_DAY_MAP: Record<string, number> = {
  U: 0,
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
  S: 6,
};

export function generateICS(
  sections: SectionDisplay[],
  courseMap: Map<string, { label: string; colorIndex?: number }>
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ScheduleNEU//EN',
    'CALSCALE:GREGORIAN',
  ];

  // Use a reasonable semester: start from next Monday, 16 weeks
  const now = new Date();
  const semesterStart = getNextWeekday(now, 1); // next Monday
  const semesterEnd = new Date(semesterStart);
  semesterEnd.setDate(semesterEnd.getDate() + 16 * 7);

  const untilStr = `${semesterEnd.getFullYear()}${String(semesterEnd.getMonth() + 1).padStart(2, '0')}${String(semesterEnd.getDate()).padStart(2, '0')}T235959Z`;

  for (const section of sections) {
    const label = courseMap.get(section.crn)?.label || 'Course';
    const days = expandDays(section.days);
    if (days.length === 0 || !section.start_time || !section.end_time) continue;

    const startTime = formatICSTime(section.start_time);
    const endTime = formatICSTime(section.end_time);
    const byDay = days.map((d) => ICS_DAY_MAP[d]).filter(Boolean).join(',');

    // Find the first occurrence
    const firstDay = days[0];
    const jsDayNum = JS_DAY_MAP[firstDay] ?? 1;
    const firstDate = getNextWeekday(semesterStart, jsDayNum);
    const dateStr = `${firstDate.getFullYear()}${String(firstDate.getMonth() + 1).padStart(2, '0')}${String(firstDate.getDate()).padStart(2, '0')}`;

    const location = section.building
      ? `${section.building} ${section.room}`
      : section.room || 'TBA';

    lines.push('BEGIN:VEVENT');
    lines.push(`DTSTART:${dateStr}T${startTime}`);
    lines.push(`DTEND:${dateStr}T${endTime}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${untilStr}`);
    lines.push(`SUMMARY:${label}`);
    lines.push(`LOCATION:${location}`);
    lines.push(`DESCRIPTION:CRN: ${section.crn}\\nProfessor: ${section.professor || 'TBA'}`);
    lines.push(`UID:${section.crn}-${dateStr}@scheduleneu`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(icsContent: string, filename: string = 'schedule.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
