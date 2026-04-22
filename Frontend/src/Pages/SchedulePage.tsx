import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScheduleStore } from '../store/scheduleStore';
import WeeklyCalendar from '../components/schedule/WeeklyCalendar';
import ScheduleSidebar from '../components/schedule/ScheduleSidebar';
import SearchBar from '../components/common/SearchBar';
import { getCourseDetail, getSectionsByCrns } from '../utils/api';
import { encodeSchedule, decodeSchedule } from '../utils/scheduleShare';
import { downloadCalendarImage, generateICS, downloadICS } from '../utils/downloadUtils';
import type { SectionDisplay } from '../types';
import { Link2, Calendar, Image, Plus, X, Eye, EyeOff, Users } from 'lucide-react';

interface ImportedSchedule {
  id: string;
  label: string;
  sections: SectionDisplay[];
  courseMap: Map<string, { label: string; colorIndex: number }>;
  visible: boolean;
}

export default function SchedulePage() {
  const { term, selectedCourses, addCourse } = useScheduleStore();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [myLink, setMyLink] = useState('');
  const [otherLinks, setOtherLinks] = useState<string[]>(['']);
  const [importedSchedules, setImportedSchedules] = useState<ImportedSchedule[]>([]);
  const [myScheduleVisible, setMyScheduleVisible] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);

  // Build list of all selected sections and a map for calendar coloring
  const { allSections, courseMap } = useMemo(() => {
    const sections: SectionDisplay[] = [];
    const map = new Map<string, { label: string; colorIndex: number }>();

    selectedCourses.forEach((course, idx) => {
      const label = `${course.subject} ${course.course_number}`;
      if (course.selectedSections.length > 0) {
        course.selectedSections.forEach((s) => {
          sections.push(s);
          map.set(s.crn, { label, colorIndex: idx });
        });
      }
    });

    return { allSections: sections, courseMap: map };
  }, [selectedCourses]);

  // Merged sections: own (if visible) + all visible imported
  const mergedSections = useMemo(() => {
    const sections: SectionDisplay[] = [];
    if (myScheduleVisible) {
      sections.push(...allSections);
    }
    importedSchedules.forEach((sched) => {
      if (sched.visible) {
        sections.push(...sched.sections);
      }
    });
    return sections;
  }, [allSections, importedSchedules, myScheduleVisible]);

  const mergedCourseMap = useMemo(() => {
    const map = new Map<string, { label: string; colorIndex: number }>();
    if (myScheduleVisible) {
      courseMap.forEach((v, k) => map.set(k, v));
    }
    importedSchedules.forEach((sched) => {
      if (sched.visible) {
        sched.courseMap.forEach((v, k) => map.set(k, v));
      }
    });
    return map;
  }, [courseMap, importedSchedules, myScheduleVisible]);

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
        selectedSections: [],
      });
    } catch {
      // ignore
    }
  }

  function handleShareLink() {
    const encoded = encodeSchedule(term, selectedCourses);
    const url = `${window.location.origin}/schedule?share=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function parseShareLink(link: string, label: string, colorOffset: number): Promise<ImportedSchedule | null> {
    try {
      const url = new URL(link);
      const shareParam = url.searchParams.get('share');
      if (!shareParam) return null;
      const data = decodeSchedule(shareParam);
      if (!data) return null;

      const allCrns = data.c.flatMap((c) => c.crns);
      if (allCrns.length === 0) return null;

      const sections = await getSectionsByCrns(data.t, allCrns);
      const map = new Map<string, { label: string; colorIndex: number }>();

      data.c.forEach((c, idx) => {
        const courseLabel = `${c.s} ${c.n}`;
        c.crns.forEach((crn) => {
          map.set(crn, { label: `${courseLabel} (${label})`, colorIndex: colorOffset + idx });
        });
      });

      return {
        id: `${Date.now()}-${Math.random()}`,
        label,
        sections,
        courseMap: map,
        visible: true,
      };
    } catch {
      return null;
    }
  }

  async function handleCompare() {
    setLoadingImport(true);
    const schedules: ImportedSchedule[] = [];
    let colorOffset = selectedCourses.length;

    // Parse "My schedule" link if provided
    if (myLink.trim()) {
      const mySched = await parseShareLink(myLink.trim(), 'You', 0);
      if (mySched) {
        schedules.push(mySched);
        colorOffset += mySched.sections.length;
      }
    }

    // Parse other people's links
    for (let i = 0; i < otherLinks.length; i++) {
      const link = otherLinks[i].trim();
      if (!link) continue;
      const sched = await parseShareLink(link, `Person ${i + 1}`, colorOffset);
      if (sched) {
        schedules.push(sched);
        colorOffset += sched.sections.length;
      }
    }

    setImportedSchedules(schedules);
    if (schedules.length > 0) {
      setCompareMode(true);
    }
    setLoadingImport(false);
  }

  function toggleScheduleVisibility(id: string) {
    setImportedSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  }

  function clearCompare() {
    setImportedSchedules([]);
    setCompareMode(false);
    setMyLink('');
    setOtherLinks(['']);
  }

  function addAnotherLink() {
    setOtherLinks((prev) => [...prev, '']);
  }

  function updateOtherLink(index: number, value: string) {
    setOtherLinks((prev) => prev.map((l, i) => (i === index ? value : l)));
  }

  function removeOtherLink(index: number) {
    setOtherLinks((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar */}
        <div>
          {!compareMode && (
            <div className="mb-4">
              <SearchBar
                onSelect={(c) => handleAddFromSearch(c)}
                placeholder="Add a course to your schedule..."
              />
            </div>
          )}

          {/* Compare Mode Controls */}
          {compareMode && importedSchedules.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users size={20} />
                  Comparing Schedules
                </h3>
                <button
                  onClick={clearCompare}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Exit Compare
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* My schedule toggle (only if user has sections loaded directly) */}
                {allSections.length > 0 && (
                  <button
                    onClick={() => setMyScheduleVisible(!myScheduleVisible)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      myScheduleVisible
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    {myScheduleVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    Your Schedule
                  </button>
                )}
                {importedSchedules.map((sched) => (
                  <button
                    key={sched.id}
                    onClick={() => toggleScheduleVisibility(sched.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      sched.visible
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    {sched.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    {sched.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mergedSections.length === 0 && !compareMode ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <p className="text-gray-400 text-lg mb-2">No sections to display</p>
              <p className="text-sm text-gray-400">
                {selectedCourses.length === 0
                  ? 'Search and add courses, then select specific sections to see them here.'
                  : `You have ${selectedCourses.length} course${selectedCourses.length !== 1 ? 's' : ''} added. Select specific sections from the search page, or go to Generate.`}
              </p>
              {selectedCourses.length > 0 && (
                <button
                  onClick={() => navigate('/generate')}
                  className="mt-4 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Generate Schedules
                </button>
              )}
            </div>
          ) : mergedSections.length === 0 && compareMode ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <p className="text-gray-400 text-lg mb-2">No schedules visible</p>
              <p className="text-sm text-gray-400">
                Toggle the visibility of schedules above to see them on the calendar.
              </p>
            </div>
          ) : (
            <div id="weekly-calendar">
              <WeeklyCalendar sections={mergedSections} courseMap={mergedCourseMap} />
            </div>
          )}

          {/* Action bar */}
          {!compareMode && allSections.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const crns = allSections.map((s) => s.crn).join(', ');
                  navigator.clipboard.writeText(crns);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
              >
                Copy CRNs
              </button>
              <button
                onClick={handleShareLink}
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
                  const ics = generateICS(allSections, courseMap);
                  downloadICS(ics);
                }}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
              >
                <Calendar size={15} />
                Download ICS
              </button>
            </div>
          )}

          {/* Compare Schedules Section */}
          {!compareMode && (
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Users size={20} />
                Compare Schedules
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Paste schedule links to view multiple schedules on one calendar. Toggle visibility to compare.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Your schedule link (optional if already loaded)</label>
                  <input
                    type="text"
                    value={myLink}
                    onChange={(e) => setMyLink(e.target.value)}
                    placeholder="Paste your share link here..."
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Other people's schedule links</label>
                  <div className="space-y-2">
                    {otherLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={link}
                          onChange={(e) => updateOtherLink(idx, e.target.value)}
                          placeholder={`Person ${idx + 1}'s share link...`}
                          className="flex-1 h-11 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {otherLinks.length > 1 && (
                          <button
                            onClick={() => removeOtherLink(idx)}
                            className="p-2.5 text-gray-400 hover:text-red-500 border border-gray-300 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addAnotherLink}
                    className="mt-2 flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <Plus size={15} />
                    Add another person
                  </button>
                </div>

                <button
                  onClick={handleCompare}
                  disabled={loadingImport || (!myLink.trim() && otherLinks.every((l) => !l.trim()))}
                  className="w-full px-5 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingImport ? 'Loading schedules...' : 'Compare Schedules'}
                </button>
              </div>
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
