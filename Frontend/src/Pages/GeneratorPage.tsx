import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy, AlertTriangle } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import WeeklyCalendar from '../components/schedule/WeeklyCalendar';
import ScheduleSidebar from '../components/schedule/ScheduleSidebar';
import FilterPanel from '../components/filters/FilterPanel';
import type { SortOption } from '../types';
import { dayLabel } from '../utils/timeUtils';

export default function GeneratorPage() {
  const {
    selectedCourses,
    generatedSchedules,
    activeScheduleIndex,
    setActiveSchedule,
    generateSchedules,
    sortBy,
    setSortBy,
  } = useScheduleStore();

  const [copied, setCopied] = useState(false);

  const activeSchedule = generatedSchedules[activeScheduleIndex] ?? null;

  const courseMap = useMemo(() => {
    if (!activeSchedule) return new Map<string, { label: string; colorIndex: number }>();
    const map = new Map<string, { label: string; colorIndex: number }>();
    activeSchedule.sections.forEach((section) => {
      const courseIdx = selectedCourses.findIndex(
        (c) =>
          c.sections.some((s) => s.crn === section.crn) ||
          c.lockedSection?.crn === section.crn
      );
      const course = selectedCourses[courseIdx];
      if (course) {
        map.set(section.crn, {
          label: `${course.subject} ${course.course_number}`,
          colorIndex: courseIdx,
        });
      }
    });
    return map;
  }, [activeSchedule, selectedCourses]);

  function handleCopyCrns() {
    if (!activeSchedule) return;
    const crns = activeSchedule.sections.map((s) => s.crn).join(', ');
    navigator.clipboard.writeText(crns);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleGenerate() {
    generateSchedules();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div>
          {generatedSchedules.length > 0 ? (
            <>
              {/* Navigation bar */}
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {generatedSchedules.length} valid schedule{generatedSchedules.length !== 1 ? 's' : ''}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="earliest">Earliest start</option>
                    <option value="latest">Latest start</option>
                    <option value="fewest_days">Fewest days</option>
                    <option value="most_open_seats">Most open seats</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSchedule(Math.max(0, activeScheduleIndex - 1))}
                    disabled={activeScheduleIndex === 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                    {activeScheduleIndex + 1} of {generatedSchedules.length}
                  </span>
                  <button
                    onClick={() =>
                      setActiveSchedule(
                        Math.min(generatedSchedules.length - 1, activeScheduleIndex + 1)
                      )
                    }
                    disabled={activeScheduleIndex === generatedSchedules.length - 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar */}
              {activeSchedule && (
                <>
                  <WeeklyCalendar sections={activeSchedule.sections} courseMap={courseMap} />

                  {/* Schedule details */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-sm text-gray-800 mb-3">Schedule Details</h3>
                    <div className="space-y-1.5">
                      {activeSchedule.sections.map((s) => {
                        const mapEntry = courseMap.get(s.crn);
                        return (
                          <div key={s.crn} className="flex items-center gap-3 text-sm">
                            <span className="font-medium text-gray-900 w-20">
                              {mapEntry?.label}
                            </span>
                            <span className="text-gray-500 font-mono">CRN {s.crn}</span>
                            <span className="text-gray-500">{s.days} {s.start_time}-{s.end_time}</span>
                            <span className="text-gray-400">{s.professor}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span>Earliest: {activeSchedule.earliestStart}</span>
                      <span>Latest: {activeSchedule.latestEnd}</span>
                      <span>Days: {activeSchedule.daysOnCampus.map(dayLabel).join(', ')}</span>
                      <span>{activeSchedule.totalCredits} credits</span>
                    </div>

                    <div className="mt-3">
                      <button
                        onClick={handleCopyCrns}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-md"
                      >
                        <Copy size={14} />
                        {copied ? 'Copied!' : 'Copy CRNs'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : selectedCourses.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
              <p className="text-gray-400 text-lg mb-2">No courses selected</p>
              <p className="text-sm text-gray-400">
                Add courses from the Search page first, then come back here to generate schedules.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
              <p className="text-gray-700 text-lg font-medium mb-2">
                Ready to generate schedules
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You have {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected.
                Click the button to find all valid, conflict-free combinations.
              </p>
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Generate Schedules
              </button>
            </div>
          )}

          {/* No results warning */}
          {selectedCourses.length > 0 &&
            generatedSchedules.length === 0 &&
            activeScheduleIndex === 0 &&
            /* only show after user has attempted generation */
            false && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">No valid schedules found</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      All possible combinations have time conflicts. Try removing a course or
                      adjusting your filters.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <ScheduleSidebar onGenerate={handleGenerate} />
            <FilterPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
