import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Copy, AlertTriangle, Loader2, Link2, Image, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import WeeklyCalendar from '../components/schedule/WeeklyCalendar';
import ScheduleSidebar from '../components/schedule/ScheduleSidebar';
import FilterPanel from '../components/filters/FilterPanel';
import type { SortOption } from '../types';
import { dayLabel } from '../utils/timeUtils';
// share encoding used inline
import { downloadCalendarImage, generateICS, downloadICS } from '../utils/downloadUtils';

export default function GeneratorPage() {
  const {
    term,
    selectedCourses,
    generatedSchedules,
    activeScheduleIndex,
    setActiveSchedule,
    generateSchedules,
    generating,
    sortBy,
    setSortBy,
    loadGeneratedSchedule,
  } = useScheduleStore();

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadGeneratedSchedule();
  }, [loadGeneratedSchedule]);

  const activeSchedule = generatedSchedules[activeScheduleIndex] ?? null;

  const courseMap = useMemo(() => {
    if (!activeSchedule) return new Map<string, { label: string; colorIndex: number }>();
    const map = new Map<string, { label: string; colorIndex: number }>();
    activeSchedule.sections.forEach((section) => {
      const detail = activeSchedule.courseDetails?.find((cd) => {
        const course = selectedCourses.find(
          (c) => c.subject === cd.subject && c.course_number === cd.course_number
        );
        if (!course) return false;
        return (
          course.sections.some((s) => s.crn === section.crn) ||
          course.selectedSections.some((s) => s.crn === section.crn)
        );
      });

      if (detail) {
        const courseIdx = selectedCourses.findIndex(
          (c) => c.subject === detail.subject && c.course_number === detail.course_number
        );
        map.set(section.crn, {
          label: `${detail.subject} ${detail.course_number}`,
          colorIndex: courseIdx >= 0 ? courseIdx : 0,
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

  async function handleGenerate() {
    setHasGenerated(true);
    await generateSchedules();
  }

  function handleShareSchedule() {
    if (!activeSchedule || !term) return;
    // Build a minimal share from the active schedule's sections
    const courseGroups = new Map<string, { s: string; n: string; crns: string[] }>();
    activeSchedule.courseDetails?.forEach((cd) => {
      courseGroups.set(`${cd.subject}-${cd.course_number}`, { s: cd.subject, n: cd.course_number, crns: [] });
    });
    activeSchedule.sections.forEach((section) => {
      const mapEntry = courseMap.get(section.crn);
      if (mapEntry) {
        const [s, n] = mapEntry.label.split(' ');
        const key = `${s}-${n}`;
        const group = courseGroups.get(key);
        if (group) group.crns.push(section.crn);
      }
    });
    const encoded = btoa(JSON.stringify({ t: term, c: Array.from(courseGroups.values()) }));
    const url = `${window.location.origin}/schedule?share=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Mobile: collapsible sidebar + filters */}
      <div className="lg:hidden space-y-3 mb-5">
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
        >
          <span>My Courses ({selectedCourses.length})</span>
          {showMobileSidebar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showMobileSidebar && (
          <div className="space-y-3">
            <ScheduleSidebar onGenerate={handleGenerate} />
          </div>
        )}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
        >
          <span>Filters</span>
          {showMobileFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showMobileFilters && (
          <FilterPanel onApply={handleGenerate} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div>
          {generating ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <Loader2 size={36} className="animate-spin text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-medium">Generating schedules...</p>
              <p className="text-sm text-gray-500 mt-1">Finding conflict-free combinations</p>
            </div>
          ) : generatedSchedules.length > 0 ? (
            <>
              {/* Navigation bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {generatedSchedules.length} valid schedule{generatedSchedules.length !== 1 ? 's' : ''}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
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
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={22} />
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
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              </div>

              {/* Calendar */}
              {activeSchedule && (
                <>
                  <div id="weekly-calendar">
                    <WeeklyCalendar sections={activeSchedule.sections} courseMap={courseMap} />
                  </div>

                  {/* Schedule details */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
                    <h3 className="font-semibold text-base text-gray-800 mb-3">Schedule Details</h3>
                    <div className="space-y-2">
                      {activeSchedule.sections.map((s) => {
                        const mapEntry = courseMap.get(s.crn);
                        return (
                          <div key={s.crn} className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-medium text-gray-900 w-24">
                              {mapEntry?.label}
                            </span>
                            <span className="text-gray-500 font-mono">CRN {s.crn}</span>
                            <span className="text-gray-500">{s.days} {s.start_time}-{s.end_time}</span>
                            <span className="text-gray-400">{s.professor}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
                      <span>Earliest: {activeSchedule.earliestStart}</span>
                      <span>Latest: {activeSchedule.latestEnd}</span>
                      <span>Days: {activeSchedule.daysOnCampus.map(dayLabel).join(', ')}</span>
                      <span>{activeSchedule.totalCredits} credits</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={handleCopyCrns}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Copy size={15} />
                        {copied ? 'Copied!' : 'Copy CRNs'}
                      </button>
                      <button
                        onClick={handleShareSchedule}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Link2 size={15} />
                        {copiedLink ? 'Copied!' : 'Share Link'}
                      </button>
                      <button
                        onClick={() => downloadCalendarImage('weekly-calendar')}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Image size={15} />
                        Download Image
                      </button>
                      <button
                        onClick={() => {
                          const ics = generateICS(activeSchedule.sections, courseMap);
                          downloadICS(ics);
                        }}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Calendar size={15} />
                        Download ICS
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : selectedCourses.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <p className="text-gray-400 text-lg mb-2">No courses selected</p>
              <p className="text-sm text-gray-400">
                Add courses from the Search page first, then come back here to generate schedules.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              {hasGenerated ? (
                <>
                  <AlertTriangle size={36} className="text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-700 text-lg font-medium mb-2">No valid schedules found</p>
                  <p className="text-sm text-gray-500 mb-6">
                    All combinations have time conflicts. Try removing a course or adjusting filters.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    Ready to generate schedules
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    You have {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected.
                    Click the button to find all valid, conflict-free combinations.
                  </p>
                </>
              )}
              <button
                onClick={handleGenerate}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Generate Schedules
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - desktop only */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <ScheduleSidebar onGenerate={handleGenerate} />
            <FilterPanel onApply={handleGenerate} />
          </div>
        </div>
      </div>
    </div>
  );
}
