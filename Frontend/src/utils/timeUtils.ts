import type { SectionDisplay, TimeSlot } from '../types';

export function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toLowerCase();

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${mins.toString().padStart(2, '0')}${period}`;
}

const DAY_ORDER = 'MTWRFSU';

export function expandDays(days: string): string[] {
  if (!days) return [];
  return days.split('').filter((d) => DAY_ORDER.includes(d));
}

export function dayLabel(d: string): string {
  const labels: Record<string, string> = {
    M: 'Mon',
    T: 'Tue',
    W: 'Wed',
    R: 'Thu',
    F: 'Fri',
    S: 'Sat',
    U: 'Sun',
  };
  return labels[d] || d;
}

export function sortDays(days: string[]): string[] {
  return [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

export function getTimeSlots(section: SectionDisplay): TimeSlot[] {
  const days = expandDays(section.days);
  const startMinutes = parseTime(section.start_time);
  const endMinutes = parseTime(section.end_time);
  if (startMinutes === 0 && endMinutes === 0) return [];
  return days.map((day) => ({ day, startMinutes, endMinutes }));
}

export function slotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  if (slot1.day !== slot2.day) return false;
  return !(slot1.endMinutes <= slot2.startMinutes || slot2.endMinutes <= slot1.startMinutes);
}

export function sectionsConflict(s1: SectionDisplay, s2: SectionDisplay): boolean {
  const slots1 = getTimeSlots(s1);
  const slots2 = getTimeSlots(s2);
  for (const a of slots1) {
    for (const b of slots2) {
      if (slotsOverlap(a, b)) return true;
    }
  }
  return false;
}

export function isValidCombination(sections: SectionDisplay[]): boolean {
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      if (sectionsConflict(sections[i], sections[j])) return false;
    }
  }
  return true;
}

export function seatColorClass(available: number, max: number): string {
  if (max === 0) return 'text-gray-500';
  const ratio = available / max;
  if (ratio > 0.5) return 'text-green-600';
  if (ratio > 0.2) return 'text-yellow-600';
  return 'text-red-600';
}
