import { create } from 'zustand';
import type {
  SelectedCourse,
  SectionDisplay,
  GeneratedSchedule,
  FilterState,
  SortOption,
} from '../types';
import { generateAllSchedules, sortSchedules } from '../utils/scheduleGenerator';

const DEFAULT_FILTERS: FilterState = {
  showOpenOnly: true,
  startTimeAfter: null,
  endTimeBefore: null,
  daysFilter: [],
  excludeDays: [],
  campusFilter: [],
  instructionalMethod: [],
  professorSearch: '',
  minSeatsAvailable: 0,
};

interface ScheduleStore {
  term: string;
  selectedCourses: SelectedCourse[];
  generatedSchedules: GeneratedSchedule[];
  activeScheduleIndex: number;
  filters: FilterState;
  sortBy: SortOption;

  setTerm: (term: string) => void;
  addCourse: (course: SelectedCourse) => void;
  addLockedSection: (
    section: SectionDisplay,
    courseInfo: { subject: string; course_number: string; course_title: string; credits: string }
  ) => void;
  removeCourse: (subject: string, course_number: string) => void;
  unlockSection: (subject: string, course_number: string) => void;
  clearCourses: () => void;
  generateSchedules: () => void;
  setActiveSchedule: (index: number) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSortBy: (sort: SortOption) => void;
  loadFromStorage: () => void;
}

function saveToStorage(term: string, courses: SelectedCourse[]) {
  try {
    localStorage.setItem(
      `schedule_${term}`,
      JSON.stringify(
        courses.map((c) => ({
          subject: c.subject,
          course_number: c.course_number,
          course_title: c.course_title,
          credits: c.credits,
          lockedCrn: c.lockedSection?.crn || null,
          sections: c.sections,
        }))
      )
    );
  } catch {
    // localStorage might be full or unavailable
  }
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  term: '',
  selectedCourses: [],
  generatedSchedules: [],
  activeScheduleIndex: 0,
  filters: { ...DEFAULT_FILTERS },
  sortBy: 'earliest',

  setTerm: (term) => {
    set({ term, selectedCourses: [], generatedSchedules: [], activeScheduleIndex: 0 });
    // Try to load saved courses for this term
    try {
      const saved = localStorage.getItem(`schedule_${term}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const courses: SelectedCourse[] = parsed.map(
          (c: { subject: string; course_number: string; course_title: string; credits: string; lockedCrn: string | null; sections: SectionDisplay[] }) => ({
            subject: c.subject,
            course_number: c.course_number,
            course_title: c.course_title,
            credits: c.credits,
            sections: c.sections,
            lockedSection: c.lockedCrn
              ? c.sections.find((s: SectionDisplay) => s.crn === c.lockedCrn)
              : undefined,
          })
        );
        set({ selectedCourses: courses });
      }
    } catch {
      // ignore parse errors
    }
  },

  addCourse: (course) => {
    const { selectedCourses, term } = get();
    const exists = selectedCourses.some(
      (c) => c.subject === course.subject && c.course_number === course.course_number
    );
    if (exists) return;
    const updated = [...selectedCourses, course];
    set({ selectedCourses: updated, generatedSchedules: [], activeScheduleIndex: 0 });
    saveToStorage(term, updated);
  },

  addLockedSection: (section, courseInfo) => {
    const { selectedCourses, term } = get();
    const existingIdx = selectedCourses.findIndex(
      (c) => c.subject === courseInfo.subject && c.course_number === courseInfo.course_number
    );
    let updated: SelectedCourse[];
    if (existingIdx >= 0) {
      updated = [...selectedCourses];
      updated[existingIdx] = { ...updated[existingIdx], lockedSection: section };
    } else {
      updated = [
        ...selectedCourses,
        {
          ...courseInfo,
          sections: [section],
          lockedSection: section,
        },
      ];
    }
    set({ selectedCourses: updated, generatedSchedules: [], activeScheduleIndex: 0 });
    saveToStorage(term, updated);
  },

  removeCourse: (subject, course_number) => {
    const { selectedCourses, term } = get();
    const updated = selectedCourses.filter(
      (c) => !(c.subject === subject && c.course_number === course_number)
    );
    set({ selectedCourses: updated, generatedSchedules: [], activeScheduleIndex: 0 });
    saveToStorage(term, updated);
  },

  unlockSection: (subject, course_number) => {
    const { selectedCourses, term } = get();
    const updated = selectedCourses.map((c) => {
      if (c.subject === subject && c.course_number === course_number) {
        return { ...c, lockedSection: undefined };
      }
      return c;
    });
    set({ selectedCourses: updated, generatedSchedules: [], activeScheduleIndex: 0 });
    saveToStorage(term, updated);
  },

  clearCourses: () => {
    const { term } = get();
    set({ selectedCourses: [], generatedSchedules: [], activeScheduleIndex: 0 });
    try {
      localStorage.removeItem(`schedule_${term}`);
    } catch {
      // ignore
    }
  },

  generateSchedules: () => {
    const { selectedCourses, filters, sortBy } = get();
    const schedules = generateAllSchedules(selectedCourses, filters);
    const sorted = sortSchedules(schedules, sortBy);
    set({ generatedSchedules: sorted, activeScheduleIndex: 0 });
  },

  setActiveSchedule: (index) => set({ activeScheduleIndex: index }),

  setFilters: (partial) => {
    const { filters } = get();
    set({ filters: { ...filters, ...partial } });
  },

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  setSortBy: (sort) => {
    const { generatedSchedules } = get();
    const sorted = sortSchedules(generatedSchedules, sort);
    set({ sortBy: sort, generatedSchedules: sorted, activeScheduleIndex: 0 });
  },

  loadFromStorage: () => {
    const { term } = get();
    if (!term) return;
    try {
      const saved = localStorage.getItem(`schedule_${term}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const courses: SelectedCourse[] = parsed.map(
          (c: { subject: string; course_number: string; course_title: string; credits: string; lockedCrn: string | null; sections: SectionDisplay[] }) => ({
            subject: c.subject,
            course_number: c.course_number,
            course_title: c.course_title,
            credits: c.credits,
            sections: c.sections,
            lockedSection: c.lockedCrn
              ? c.sections.find((s: SectionDisplay) => s.crn === c.lockedCrn)
              : undefined,
          })
        );
        set({ selectedCourses: courses });
      }
    } catch {
      // ignore
    }
  },
}));
