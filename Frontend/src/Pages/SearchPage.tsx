import { useState, useCallback } from 'react';
import SearchBar from '../components/common/SearchBar';
import CourseList from '../components/course/CourseList';
import ScheduleSidebar from '../components/schedule/ScheduleSidebar';
import { useScheduleStore } from '../store/scheduleStore';
import { useApi } from '../hooks/useApi';
import { getSubjects, getCourses, searchCourses } from '../utils/api';
import { getCourseDetail } from '../utils/api';
import type { CourseListItem } from '../types';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const { term, selectedCourses, addCourse } = useScheduleStore();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseListItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: subjects } = useApi(
    () => (term ? getSubjects(term) : Promise.resolve([])),
    [term]
  );

  const { data: browseCourses, loading: browseLoading, error: browseError } = useApi(
    () =>
      term && selectedSubject
        ? getCourses(term, { subject: selectedSubject })
        : Promise.resolve([]),
    [term, selectedSubject]
  );

  const selectedKeys = new Set(
    selectedCourses.map((c) => `${c.subject}-${c.course_number}`)
  );

  const handleSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
      if (!q.trim() || !term) {
        setSearchResults(null);
        return;
      }
      setSearchLoading(true);
      setSearchError(null);
      try {
        const data = await searchCourses(term, q, { limit: 50 });
        setSearchResults(data);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Search failed');
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    },
    [term]
  );

  async function handleAddCourse(course: CourseListItem) {
    if (!term) return;
    try {
      const detail = await getCourseDetail(term, course.subject, course.course_number);
      addCourse({
        subject: detail.subject,
        course_number: detail.course_number,
        course_title: detail.course_title,
        credits: detail.credits,
        sections: detail.sections,
      });
    } catch {
      // fallback: add with no sections
      addCourse({
        subject: course.subject,
        course_number: course.course_number,
        course_title: course.course_title,
        credits: course.credits,
        sections: [],
      });
    }
  }

  const showingSearch = searchQuery.trim().length > 0;
  const displayCourses = showingSearch ? searchResults : browseCourses;
  const displayLoading = showingSearch ? searchLoading : browseLoading;
  const displayError = showingSearch ? searchError : browseError;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div>
          {/* Search & Filters */}
          <div className="mb-4 space-y-3">
            <SearchBar
              onSelect={(course) => navigate(`/course/${course.subject}/${course.course_number}`)}
              placeholder="Search courses (e.g., CS2500, programming)..."
              className="w-full"
            />

            <div className="flex items-center gap-3">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSearchQuery('');
                  setSearchResults(null);
                }}
                className="h-9 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Subjects</option>
                {subjects?.map((s) => (
                  <option key={s.subject} value={s.subject}>
                    {s.subject} - {s.subject_description}
                  </option>
                ))}
              </select>

              {/* Inline quick search */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Filter by keyword..."
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          {!selectedSubject && !showingSearch ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium mb-1">Select a subject or search to browse courses</p>
              <p className="text-sm">Use the dropdown or search bar above to get started</p>
            </div>
          ) : (
            <CourseList
              courses={displayCourses}
              loading={displayLoading}
              error={displayError}
              onAddCourse={handleAddCourse}
              selectedCourseKeys={selectedKeys}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <ScheduleSidebar onGenerate={() => navigate('/generate')} />
          </div>
        </div>
      </div>
    </div>
  );
}
