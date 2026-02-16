import type { CourseListItem } from '../../types';
import CourseCard from './CourseCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface CourseListProps {
  courses: CourseListItem[] | null;
  loading: boolean;
  error: string | null;
  onAddCourse?: (course: CourseListItem) => void;
  selectedCourseKeys?: Set<string>;
}

export default function CourseList({
  courses,
  loading,
  error,
  onAddCourse,
  selectedCourseKeys,
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
          isSelected={selectedCourseKeys?.has(`${course.subject}-${course.course_number}`)}
        />
      ))}
    </div>
  );
}
