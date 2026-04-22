import type { CourseListItem } from '../../types';
import CourseCard from './CourseCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface CourseListProps {
  courses: CourseListItem[] | null;
  loading: boolean;
  error: string | null;
  onAddCourse?: (course: CourseListItem) => void;
  onCourseClick?: (course: CourseListItem) => void;
  selectedCourseKeys?: Set<string>;
  activeCourse?: { subject: string; course_number: string } | null;
}

export default function CourseList({
  courses,
  loading,
  error,
  onAddCourse,
  onCourseClick,
  selectedCourseKeys,
  activeCourse,
}: CourseListProps) {
  if (loading) return <LoadingSpinner message="Loading courses..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm mb-2">Failed to load courses</p>
        <p className="text-gray-400 text-xs">{error}</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No courses found. Try a different search or subject.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {courses.map((course) => (
        <CourseCard
          key={course.subject_course}
          course={course}
          onAddCourse={onAddCourse}
          onCourseClick={onCourseClick}
          isSelected={selectedCourseKeys?.has(`${course.subject}-${course.course_number}`)}
          isActive={
            activeCourse?.subject === course.subject &&
            activeCourse?.course_number === course.course_number
          }
        />
      ))}
    </div>
  );
}
