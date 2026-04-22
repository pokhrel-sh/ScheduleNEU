import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getCourseDetail } from '../utils/api';
import { useScheduleStore } from '../store/scheduleStore';
import SectionTable from '../components/course/SectionTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { SectionDisplay } from '../types';

export default function CourseDetailPage() {
  const { subject, number } = useParams<{ subject: string; number: string }>();
  const navigate = useNavigate();
  const { term, selectedCourses, addCourse, toggleSelectedSection } = useScheduleStore();

  const { data: course, loading, error } = useApi(
    () => (term && subject && number ? getCourseDetail(term, subject, number) : Promise.reject('Missing params')),
    [term, subject, number]
  );

  const isSelected = selectedCourses.some(
    (c) => c.subject === subject && c.course_number === number
  );

  const selectedCrns =
    selectedCourses
      .find((c) => c.subject === subject && c.course_number === number)
      ?.selectedSections.map((s) => s.crn) || [];

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

  if (loading) return <LoadingSpinner message="Loading course details..." />;

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-2">Failed to load course</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 text-sm text-red-600 hover:text-red-800"
        >
          Back to search
        </button>
      </div>
    );
  }

  const openCount = course.sections.filter((s) => s.is_open).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {course.subject} {course.course_number}
              </h1>
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

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-base text-gray-800 mb-3">Sections</h2>
        <SectionTable
          sections={course.sections}
          onToggleSection={handleToggleSection}
          selectedCrns={selectedCrns}
        />
      </div>
    </div>
  );
}
