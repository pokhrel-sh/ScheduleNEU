import { create } from 'zustand';
import type {
  SelectedCourse,
  SectionDisplay,
  GeneratedSchedule,
  FilterState,
  SortOption,
} from '../types';
import { sortSchedules } from '../utils/scheduleGenerator';
import { generateSchedules as generateSchedulesApi } from '../utils/api';

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
  generating: boolean;

  setTerm: (term: string) => void;
  addCourse: (course: SelectedCourse) => void;
  toggleSelectedSection: (
    section: SectionDisplay,
    courseInfo: { subject: string; course_number: string; course_title: string; credits: string },
    allSections?: SectionDisplay[]
  ) => void;
  clearSelectedSections: (subject: string, course_number: string) => void;
  removeCourse: (subject: string, course_number: string) => void;
  clearCourses: () => void;
  generateSchedules: () => Promise<void>;
  setActiveSchedule: (index: number) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSortBy: (sort: SortOption) => void;
  loadFromStorage: () => void;
  loadGeneratedSchedule: () => void;
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
          selectedCrns: c.selectedSections.map((s) => s.crn),
          sections: c.sections,
        }))
      )
    );
  } catch {
    // localStorage might be full or unavailable
  }
}

function restoreCourses(parsed: Array<{
  subject: string;
  course_number: string;
  course_title: string;
  credits: string;
  selectedCrns?: string[];
  lockedCrn?: string | null;
  sections: SectionDisplay[];
}>): SelectedCourse[] {
  return parsed.map((c) => {
    // Support both old format (lockedCrn) and new format (selectedCrns)
    let selectedSections: SectionDisplay[] = [];
    if (c.selectedCrns && c.selectedCrns.length > 0) {
      selectedSections = c.sections.filter((s) => c.selectedCrns!.includes(s.crn));
    } else if (c.lockedCrn) {
      const locked = c.sections.find((s) => s.crn === c.lockedCrn);
      if (locked) selectedSections = [locked];
    }
    return {
      subject: c.subject,
      course_number: c.course_number,
      course_title: c.course_title,
      credits: c.credits,
      sections: c.sections,
      selectedSections,
    };
  });
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  term: '',
  selectedCourses: [],
  generatedSchedules: [],
  activeScheduleIndex: 0,
  filters: { ...DEFAULT_FILTERS },
  sortBy: 'earliest',
  generating: false,

  setTerm: (term) => {
    set({ term, selectedCourses: [], generatedSchedules: [], activeScheduleIndex: 0 });
    try {
      const saved = localStorage.getItem(`schedule_${term}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ selectedCourses: restoreCourses(parsed) });
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
    const newCourse: SelectedCourse = {
      ...course,
      selectedSections: course.selectedSections ?? [],
    };
    const updated = [...selectedCourses, newCourse];
    set({ selectedCourses: updated, generatedSchedules: [], activeScheduleIndex: 0 });
    saveToStorage(term, updated);
  },

  toggleSelectedSection: (section, courseInfo, allSections) => {
    const { selectedCourses, term } = get();
    const existingIdx = selectedCourses.findIndex(
      (c) => c.subject === courseInfo.subject && c.course_number === courseInfo.course_number
    );
    let updated: SelectedCourse[];
    if (existingIdx >= 0) {
      updated = [...selectedCourses];
      const course = { ...updated[existingIdx] };
      const alreadySelected = course.selectedSections.some((s) => s.crn === section.crn);
      if (alreadySelected) {
        course.selectedSections = course.selectedSections.filter((s) => s.crn !== section.crn);
      } else {
        course.selectedSections = [...course.selectedSections, section];
      }
      updated[existingIdx] = course;
    } else {
      updated = [
        ...selectedCourses,
        {
          ...courseInfo,
          sections: allSections || [section],
          selectedSections: [section],
        },
      ];
    }
    set({ selectedCourses: updated, generatedSchedules: [], activeScheduleIndex: 0 });
    saveToStorage(term, updated);
  },

  clearSelectedSections: (subject, course_number) => {
    const { selectedCourses, term } = get();
    const updated = selectedCourses.map((c) => {
      if (c.subject === subject && c.course_number === course_number) {
        return { ...c, selectedSections: [] };
      }
      return c;
    });
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

  clearCourses: () => {
    const { term } = get();
    set({ selectedCourses: [], generatedSchedules: [], activeScheduleIndex: 0 });
    try {
      localStorage.removeItem(`schedule_${term}`);
      localStorage.removeItem(`generated_schedule_${term}`);
    } catch {
      // ignore
    }
  },

  generateSchedules: async () => {
    const { selectedCourses, filters, sortBy, term } = get();
    if (!term || selectedCourses.length === 0) return;
    set({ generating: true });
    try {
      const request = {
        courses: selectedCourses.map((c) => ({
          subject: c.subject,
          course_number: c.course_number,
          course_title: c.course_title,
          credits: c.credits,
          section_crns: c.selectedSections.map((s) => s.crn),
        })),
        filters,
      };
      const schedules = await generateSchedulesApi(term, request);
      const sorted = sortSchedules(schedules, sortBy);
      set({ generatedSchedules: sorted, activeScheduleIndex: 0, generating: false });
      // Persist
      try {
        localStorage.setItem(
          `generated_schedule_${term}`,
          JSON.stringify({ schedules: sorted, activeIndex: 0 })
        );
      } catch { /* ignore */ }
    } catch {
      set({ generatedSchedules: [], activeScheduleIndex: 0, generating: false });
    }
  },

  setActiveSchedule: (index) => {
    const { term, generatedSchedules } = get();
    set({ activeScheduleIndex: index });
    try {
      localStorage.setItem(
        `generated_schedule_${term}`,
        JSON.stringify({ schedules: generatedSchedules, activeIndex: index })
      );
    } catch { /* ignore */ }
  },

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
        set({ selectedCourses: restoreCourses(parsed) });
      }
    } catch {
      // ignore
    }
  },

  loadGeneratedSchedule: () => {
    const { term } = get();
    if (!term) return;
    try {
      const saved = localStorage.getItem(`generated_schedule_${term}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          generatedSchedules: parsed.schedules || [],
          activeScheduleIndex: parsed.activeIndex || 0,
        });
      }
    } catch {
      // ignore
    }
  },
}));
