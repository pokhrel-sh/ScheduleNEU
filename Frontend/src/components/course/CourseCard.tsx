import { ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CourseListItem } from '../../types';

interface CourseCardProps {
  course: CourseListItem;
  onAddCourse?: (course: CourseListItem) => void;
  onCourseClick?: (course: CourseListItem) => void;
  isSelected?: boolean;
  isActive?: boolean;
}

export default function CourseCard({ course, onAddCourse, onCourseClick, isSelected, isActive }: CourseCardProps) {
  const navigate = useNavigate();

  function handleClick() {
    if (onCourseClick) {
      onCourseClick(course);
    } else {
      navigate(`/course/${course.subject}/${course.course_number}`);
    }
  }

  return (
    <div
      className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${
        isActive ? 'border-red-400 ring-2 ring-red-100' : isSelected ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-base text-gray-900">
              {course.subject} {course.course_number}
            </span>
            <span className="text-sm text-gray-500">{course.credits} cr</span>
          </div>
          <p className="text-sm text-gray-700 truncate mt-0.5">{course.course_title}</p>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
            <span>
              {course.section_count} section{course.section_count !== 1 ? 's' : ''}
            </span>
            <span className={course.open_section_count > 0 ? 'text-green-600' : 'text-red-500'}>
              {course.open_section_count} open
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 shrink-0">
          {onAddCourse && !isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddCourse(course);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          )}
          {isSelected && (
            <span className="text-sm text-red-600 font-medium px-3 py-1 bg-red-50 rounded-lg">
              Added
            </span>
          )}
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
