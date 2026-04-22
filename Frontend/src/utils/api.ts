import axios from 'axios';
import type {
  Term,
  Subject,
  CodeDescription,
  CourseListItem,
  CourseWithSections,
  SectionDisplay,
  GeneratedSchedule,
  FilterState,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Terms & metadata
export async function getTerms(): Promise<Term[]> {
  const { data } = await api.get<Term[]>('/api/terms');
  return data;
}

export async function getSubjects(term: string): Promise<Subject[]> {
  const { data } = await api.get<Subject[]>(`/api/terms/${term}/subjects`);
  return data;
}

export async function getCampuses(term: string): Promise<CodeDescription[]> {
  const { data } = await api.get<CodeDescription[]>(`/api/terms/${term}/campuses`);
  return data;
}

export async function getInstructionalMethods(term: string): Promise<CodeDescription[]> {
  const { data } = await api.get<CodeDescription[]>(`/api/terms/${term}/instructional-methods`);
  return data;
}

// Courses
export async function getCourses(
  term: string,
  params?: { subject?: string; is_open?: boolean; limit?: number }
): Promise<CourseListItem[]> {
  const { data } = await api.get<CourseListItem[]>(`/api/terms/${term}/courses`, { params });
  return data;
}

export async function searchCourses(
  term: string,
  query: string,
  params?: { is_open?: boolean; limit?: number }
): Promise<CourseListItem[]> {
  const { data } = await api.get<CourseListItem[]>(`/api/terms/${term}/courses/search`, {
    params: { q: query, ...params },
  });
  return data;
}

export async function getCourseDetail(
  term: string,
  subject: string,
  courseNumber: string
): Promise<CourseWithSections> {
  const { data } = await api.get<CourseWithSections>(
    `/api/terms/${term}/courses/${subject}/${courseNumber}`
  );
  return data;
}

// Sections
export async function getSectionByCrn(term: string, crn: string): Promise<SectionDisplay> {
  const { data } = await api.get<SectionDisplay>(`/api/terms/${term}/sections/${crn}`);
  return data;
}

export async function getSectionsByCrns(term: string, crns: string[]): Promise<SectionDisplay[]> {
  const { data } = await api.get<SectionDisplay[]>(`/api/terms/${term}/sections`, {
    params: { crns: crns.join(',') },
  });
  return data;
}

// Schedule generation
export interface GenerateRequest {
  courses: {
    subject: string;
    course_number: string;
    course_title: string;
    credits: string;
    section_crns: string[];
  }[];
  filters: FilterState;
  max_schedules?: number;
}

export async function generateSchedules(
  term: string,
  request: GenerateRequest
): Promise<GeneratedSchedule[]> {
  const { data } = await api.post<GeneratedSchedule[]>(
    `/api/terms/${term}/generate-schedules`,
    request
  );
  return data;
}
