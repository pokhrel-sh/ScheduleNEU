import { Plus, BookOpen } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';
import SectionTable from './SectionTable';
import LoadingSpinner from '../common/LoadingSpinner';
import type { CourseWithSections, SectionDisplay } from '../../types';

interface CourseDetailPanelProps {
  course: CourseWithSections | null;
  loading: boolean;
  error?: string | null;
}

export default function CourseDetailPanel({ course, loading, error }: CourseDetailPanelProps) {
  const { selectedCourses, addCourse, toggleSelectedSection } = useScheduleStore();

  if (loading) return <LoadingSpinner message="Loading course details..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm mb-2">Failed to load course</p>
        <p className="text-gray-400 text-xs">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 py-16">
        <div className="text-center">
          <p className="text-lg font-medium mb-1">Select a course</p>
          <p className="text-sm">Click on a course from the list to view its sections</p>
        </div>
      </div>
    );
  }

  const isSelected = selectedCourses.some(
    (c) => c.subject === course.subject && c.course_number === course.course_number
  );

  const selectedCrns =
    selectedCourses
      .find((c) => c.subject === course.subject && c.course_number === course.course_number)
      ?.selectedSections.map((s) => s.crn) || [];

  const openCount = course.sections.filter((s) => s.is_open).length;

  function handleAddCourse() {
    if (!course) return;
    addCourse({
      subject: course.subject,
      course_number: course.course_number,
      course_title: course.course_title,
      credits: course.credits,
      sections: course.sections,
      selectedSections: [],
    });
  }

  function handleToggleSection(section: SectionDisplay) {
    if (!course) return;
    toggleSelectedSection(
      section,
      {
        subject: course.subject,
        course_number: course.course_number,
        course_title: course.course_title,
        credits: course.credits,
      },
      course.sections
    );
  }

  return (
    <div>
      {/* Course header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">
                {course.subject} {course.course_number}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                {course.credits} credits
              </span>
            </div>
            <p className="text-base text-gray-700 mb-2">{course.course_title}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{course.sections.length} sections</span>
              <span className={openCount > 0 ? 'text-green-600' : 'text-red-500'}>
                {openCount} open
              </span>
              {selectedCrns.length > 0 && (
                <span className="text-red-600 font-medium">
                  {selectedCrns.length} selected
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!isSelected ? (
              <button
                onClick={handleAddCourse}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={16} />
                Add All
              </button>
            ) : (
              <span className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <BookOpen size={16} />
                Added
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section table - no max height, full display */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-base text-gray-800 mb-3">Sections</h3>
        <SectionTable
          sections={course.sections}
          onToggleSection={handleToggleSection}
          selectedCrns={selectedCrns}
        />
      </div>
    </div>
  );
}
