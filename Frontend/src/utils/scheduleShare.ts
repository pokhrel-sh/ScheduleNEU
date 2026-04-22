import type { SelectedCourse } from '../types';

interface ShareData {
  t: string; // term
  c: { s: string; n: string; crns: string[] }[]; // courses with selected CRNs
}

export function encodeSchedule(term: string, courses: SelectedCourse[]): string {
  const data: ShareData = {
    t: term,
    c: courses.map((c) => ({
      s: c.subject,
      n: c.course_number,
      crns:
        c.selectedSections.length > 0
          ? c.selectedSections.map((s) => s.crn)
          : [],
    })),
  };
  return btoa(JSON.stringify(data));
}

export function decodeSchedule(encoded: string): ShareData | null {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}
