import { useState, useCallback } from 'react';
import SearchBar from '../components/common/SearchBar';
import CourseList from '../components/course/CourseList';
import CourseDetailPanel from '../components/course/CourseDetailPanel';
import ScheduleSidebar from '../components/schedule/ScheduleSidebar';
import { useScheduleStore } from '../store/scheduleStore';
import { useApi } from '../hooks/useApi';
import { getSubjects, getCourses, searchCourses, getCourseDetail } from '../utils/api';
import type { CourseListItem, CourseWithSections } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SearchPage() {
  const { term, selectedCourses, addCourse } = useScheduleStore();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseListItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [detailCourse, setDetailCourse] = useState<{ subject: string; course_number: string } | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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

  // Default courses when no subject selected and no search
  const { data: defaultCourses, loading: defaultLoading, error: defaultError } = useApi(
    () => (term ? getCourses(term, { limit: 50 }) : Promise.resolve([])),
    [term]
  );

  // Course detail for right panel
  const { data: courseDetail, loading: detailLoading, error: detailError } = useApi(
    () =>
      detailCourse && term
        ? getCourseDetail(term, detailCourse.subject, detailCourse.course_number)
        : Promise.resolve(null as CourseWithSections | null),
    [term, detailCourse?.subject, detailCourse?.course_number]
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
        selectedSections: [],
      });
    } catch {
      addCourse({
        subject: course.subject,
        course_number: course.course_number,
        course_title: course.course_title,
        credits: course.credits,
        sections: [],
        selectedSections: [],
      });
    }
  }

  function handleCourseClick(course: CourseListItem) {
    setDetailCourse({ subject: course.subject, course_number: course.course_number });
    setShowMobileDetail(true);
  }

  const showingSearch = searchQuery.trim().length > 0;
  const showingSubject = !!selectedSubject;

  let displayCourses: CourseListItem[] | null;
  let displayLoading: boolean;
  let displayError: string | null;

  if (showingSearch) {
    displayCourses = searchResults;
    displayLoading = searchLoading;
    displayError = searchError;
  } else if (showingSubject) {
    displayCourses = browseCourses;
    displayLoading = browseLoading;
    displayError = browseError;
  } else {
    displayCourses = defaultCourses;
    displayLoading = defaultLoading;
    displayError = defaultError;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Search & Filters */}
      <div className="mb-5 space-y-3">
        <SearchBar
          onSelect={(course) => {
            setDetailCourse({ subject: course.subject, course_number: course.course_number });
            setShowMobileDetail(true);
          }}
          placeholder="Search courses (e.g., CS2500, programming)..."
          className="w-full"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSearchQuery('');
              setSearchResults(null);
            }}
            className="h-11 px-4 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Subjects</option>
            {subjects?.map((s) => (
              <option key={s.subject} value={s.subject}>
                {s.subject} - {s.subject_description}
              </option>
            ))}
          </select>

          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile: My Courses toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
        >
          <span>My Courses ({selectedCourses.length})</span>
          {showMobileSidebar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showMobileSidebar && (
          <div className="mt-2">
            <ScheduleSidebar onGenerate={() => navigate('/generate')} />
          </div>
        )}
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr_320px] gap-6">
        {/* Left: Course list */}
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          <CourseList
            courses={displayCourses}
            loading={displayLoading}
            error={displayError}
            onAddCourse={handleAddCourse}
            onCourseClick={handleCourseClick}
            selectedCourseKeys={selectedKeys}
            activeCourse={detailCourse}
          />
        </div>

        {/* Center: Course detail panel - desktop */}
        <div className="hidden lg:block overflow-y-auto">
          <CourseDetailPanel
            course={courseDetail ?? null}
            loading={detailLoading}
            error={detailError}
          />
        </div>

        {/* Center: Course detail panel - mobile overlay */}
        {showMobileDetail && detailCourse && (
          <div className="lg:hidden fixed inset-0 z-40 bg-gray-50 overflow-y-auto">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setShowMobileDetail(false)}
                className="text-sm text-gray-600 font-medium"
              >
                Back to list
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {detailCourse.subject} {detailCourse.course_number}
              </span>
              <div className="w-16" />
            </div>
            <div className="p-4">
              <CourseDetailPanel
                course={courseDetail ?? null}
                loading={detailLoading}
                error={detailError}
              />
            </div>
          </div>
        )}

        {/* Right: Sidebar - desktop only */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <ScheduleSidebar onGenerate={() => navigate('/generate')} />
          </div>
        </div>
      </div>
    </div>
  );
}
