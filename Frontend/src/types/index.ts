// API response types
export interface Term {
  term: string;
  term_description: string | null;
}

export interface Subject {
  subject: string;
  subject_description: string | null;
}

export interface CodeDescription {
  code: string;
  description: string;
}

export interface CourseListItem {
  subject: string;
  course_number: string;
  subject_course: string;
  course_title: string;
  credits: string;
  subject_description: string | null;
  section_count: number;
  open_section_count: number;
}

export interface SectionDisplay {
  crn: string;
  seats_available: number;
  max_enrollment: number;
  days: string;
  start_time: string;
  end_time: string;
  room: string;
  building: string;
  professor: string;
  campus: string;
  schedule_type: string;
  instructional_method: string;
  waitlist_available: number;
  waitlist_count: number;
  is_open: boolean;
  sequence_number: string;
}

export interface CourseWithSections {
  subject: string;
  course_number: string;
  subject_course: string;
  course_title: string;
  credits: string;
  credit_hours: number | null;
  credit_hour_low: number | null;
  credit_hour_high: number | null;
  subject_description: string;
  sections: SectionDisplay[];
}

// App state types
export interface SelectedCourse {
  subject: string;
  course_number: string;
  course_title: string;
  credits: string;
  sections: SectionDisplay[];
  selectedSections: SectionDisplay[];
}

export interface GeneratedSchedule {
  id: number;
  sections: SectionDisplay[];
  courseDetails: { subject: string; course_number: string; course_title: string; credits: string }[];
  totalCredits: number;
  earliestStart: string;
  latestEnd: string;
  daysOnCampus: string[];
}

export interface FilterState {
  showOpenOnly: boolean;
  startTimeAfter: string | null;
  endTimeBefore: string | null;
  daysFilter: string[];
  excludeDays: string[];
  campusFilter: string[];
  instructionalMethod: string[];
  professorSearch: string;
  minSeatsAvailable: number;
}

export type SortOption = 'earliest' | 'latest' | 'fewest_days' | 'most_open_seats';

export interface TimeSlot {
  day: string;
  startMinutes: number;
  endMinutes: number;
}
