import { Trash2, Sparkles } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';
import SelectedCourseItem from './SelectedCourseItem';

interface ScheduleSidebarProps {
  onGenerate?: () => void;
}

export default function ScheduleSidebar({ onGenerate }: ScheduleSidebarProps) {
  const { selectedCourses, removeCourse, unlockSection, clearCourses } = useScheduleStore();

  const totalCredits = selectedCourses.reduce(
    (sum, c) => sum + (parseFloat(c.credits) || 0),
    0
  );

  const totalCombinations = selectedCourses.reduce((product, c) => {
    const count = c.lockedSection ? 1 : c.sections.length;
    return product * count;
  }, selectedCourses.length > 0 ? 1 : 0);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-800">
          My Courses ({selectedCourses.length})
        </h3>
        {selectedCourses.length > 0 && (
          <button
            onClick={clearCourses}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Clear all courses"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="p-3 space-y-2 max-h-[50vh] overflow-y-auto">
        {selectedCourses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Search and add courses to get started
          </p>
        ) : (
          selectedCourses.map((course, idx) => (
            <SelectedCourseItem
              key={`${course.subject}-${course.course_number}`}
              course={course}
              colorIndex={idx}
              onRemove={() => removeCourse(course.subject, course.course_number)}
              onUnlock={() => unlockSection(course.subject, course.course_number)}
            />
          ))
        )}
      </div>

      {selectedCourses.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total: {totalCredits} credits</span>
            <span>{totalCombinations.toLocaleString()} combinations</span>
          </div>
          {onGenerate && (
            <button
              onClick={onGenerate}
              disabled={selectedCourses.length < 1}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={16} />
              Generate Schedules
            </button>
          )}
        </div>
      )}
    </div>
  );
}
