import { X, Lock, Unlock } from 'lucide-react';
import type { SelectedCourse } from '../../types';

interface SelectedCourseItemProps {
  course: SelectedCourse;
  colorIndex: number;
  onRemove: () => void;
  onUnlock: () => void;
}

const COLOR_DOTS = [
  'bg-blue-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-teal-400',
  'bg-indigo-400',
  'bg-yellow-400',
];

export default function SelectedCourseItem({
  course,
  colorIndex,
  onRemove,
  onUnlock,
}: SelectedCourseItemProps) {
  const dotColor = COLOR_DOTS[colorIndex % COLOR_DOTS.length];
  const sectionCount = course.lockedSection ? 1 : course.sections.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${dotColor}`} />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {course.subject} {course.course_number}
            </p>
            <p className="text-xs text-gray-500 truncate">{course.course_title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{course.credits} cr</span>
              <span className="text-xs text-gray-400">
                {sectionCount} section{sectionCount !== 1 ? 's' : ''}
              </span>
            </div>
            {course.lockedSection && (
              <div className="flex items-center gap-1 mt-1">
                <Lock size={10} className="text-red-500" />
                <span className="text-xs text-red-600">
                  CRN {course.lockedSection.crn} locked
                </span>
                <button
                  onClick={onUnlock}
                  className="ml-1 text-xs text-gray-400 hover:text-gray-600"
                  title="Unlock section"
                >
                  <Unlock size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
