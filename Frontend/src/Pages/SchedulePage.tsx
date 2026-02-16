import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScheduleStore } from '../store/scheduleStore';
import WeeklyCalendar from '../components/schedule/WeeklyCalendar';
import ScheduleSidebar from '../components/schedule/ScheduleSidebar';
import SearchBar from '../components/common/SearchBar';
import { getCourseDetail } from '../utils/api';
import type { SectionDisplay } from '../types';

export default function SchedulePage() {
  const { term, selectedCourses, addCourse } = useScheduleStore();
  const navigate = useNavigate();

  // Build list of all sections and a map for calendar coloring
  const { allSections, courseMap } = useMemo(() => {
    const sections: SectionDisplay[] = [];
    const map = new Map<string, { label: string; colorIndex: number }>();

    selectedCourses.forEach((course, idx) => {
      const label = `${course.subject} ${course.course_number}`;
      if (course.lockedSection) {
        sections.push(course.lockedSection);
        map.set(course.lockedSection.crn, { label, colorIndex: idx });
      }
      // If not locked, we don't show anything on the simple schedule view
      // (use Generate page for that)
    });

    return { allSections: sections, courseMap: map };
  }, [selectedCourses]);

  async function handleAddFromSearch(course: { subject: string; course_number: string; course_title: string; credits: string }) {
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
      // ignore
    }
  }

  const lockedCount = selectedCourses.filter((c) => c.lockedSection).length;
  const unlockedCount = selectedCourses.length - lockedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Calendar */}
        <div>
          <div className="mb-4">
            <SearchBar
              onSelect={(c) => handleAddFromSearch(c)}
              placeholder="Add a course to your schedule..."
            />
          </div>

          {allSections.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
              <p className="text-gray-400 text-lg mb-2">No locked sections to display</p>
              <p className="text-sm text-gray-400">
                {selectedCourses.length === 0
                  ? 'Search and add courses, then lock specific sections to see them here.'
                  : `You have ${unlockedCount} course${unlockedCount !== 1 ? 's' : ''} added but no sections locked. Lock a specific section from the course detail page, or go to Generate to see all valid combinations.`}
              </p>
              {selectedCourses.length > 0 && (
                <button
                  onClick={() => navigate('/generate')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Generate Schedules
                </button>
              )}
            </div>
          ) : (
            <WeeklyCalendar sections={allSections} courseMap={courseMap} />
          )}

          {allSections.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => {
                  const crns = allSections.map((s) => s.crn).join(', ');
                  navigator.clipboard.writeText(crns);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-md"
              >
                Copy CRNs
              </button>
            </div>
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
