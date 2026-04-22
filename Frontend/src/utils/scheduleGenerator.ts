import type { SelectedCourse, SectionDisplay, GeneratedSchedule, FilterState, SortOption } from '../types';
import { sectionsConflict, parseTime, expandDays, sortDays } from './timeUtils';

export function applyFilters(sections: SectionDisplay[], filters: FilterState): SectionDisplay[] {
  return sections.filter((section) => {
    if (filters.showOpenOnly && !section.is_open) return false;

    if (filters.minSeatsAvailable && section.seats_available < filters.minSeatsAvailable)
      return false;

    if (filters.startTimeAfter) {
      const sectionStart = parseTime(section.start_time);
      const filterStart = parseTime(filters.startTimeAfter);
      if (sectionStart && filterStart && sectionStart < filterStart) return false;
    }

    if (filters.endTimeBefore) {
      const sectionEnd = parseTime(section.end_time);
      const filterEnd = parseTime(filters.endTimeBefore);
      if (sectionEnd && filterEnd && sectionEnd > filterEnd) return false;
    }

    if (filters.daysFilter.length > 0) {
      const sectionDays = expandDays(section.days);
      if (sectionDays.length > 0 && !sectionDays.every((d) => filters.daysFilter.includes(d)))
        return false;
    }

    if (filters.excludeDays.length > 0) {
      const sectionDays = expandDays(section.days);
      if (sectionDays.some((d) => filters.excludeDays.includes(d))) return false;
    }

    if (filters.campusFilter.length > 0) {
      if (!filters.campusFilter.includes(section.campus)) return false;
    }

    if (filters.instructionalMethod.length > 0) {
      if (!filters.instructionalMethod.includes(section.instructional_method)) return false;
    }

    if (filters.professorSearch) {
      if (!section.professor.toLowerCase().includes(filters.professorSearch.toLowerCase()))
        return false;
    }

    return true;
  });
}

const MAX_SCHEDULES = 500;

export function generateAllSchedules(
  selectedCourses: SelectedCourse[],
  filters: FilterState
): GeneratedSchedule[] {
  if (selectedCourses.length === 0) return [];

  const courseOptions: { course: SelectedCourse; sections: SectionDisplay[] }[] = [];
  for (const course of selectedCourses) {
    if (course.selectedSections.length > 0) {
      courseOptions.push({ course, sections: course.selectedSections });
    } else {
      const filtered = applyFilters(course.sections, filters);
      if (filtered.length === 0) return [];
      courseOptions.push({ course, sections: filtered });
    }
  }

  const validSchedules: GeneratedSchedule[] = [];
  let scheduleId = 0;

  function buildCombination(courseIndex: number, currentSections: SectionDisplay[]) {
    if (validSchedules.length >= MAX_SCHEDULES) return;

    if (courseIndex === courseOptions.length) {
      const courseDetails = courseOptions.map((co) => ({
        subject: co.course.subject,
        course_number: co.course.course_number,
        course_title: co.course.course_title,
        credits: co.course.credits,
      }));
      const totalCredits = courseDetails.reduce(
        (sum, c) => sum + (parseFloat(c.credits) || 0),
        0
      );

      let earliest = Infinity;
      let earliestStr = '';
      let latest = 0;
      let latestStr = '';
      const daysSet = new Set<string>();

      for (const s of currentSections) {
        const start = parseTime(s.start_time);
        const end = parseTime(s.end_time);
        if (start && start < earliest) {
          earliest = start;
          earliestStr = s.start_time;
        }
        if (end && end > latest) {
          latest = end;
          latestStr = s.end_time;
        }
        for (const d of expandDays(s.days)) {
          daysSet.add(d);
        }
      }

      validSchedules.push({
        id: ++scheduleId,
        sections: [...currentSections],
        courseDetails,
        totalCredits,
        earliestStart: earliestStr,
        latestEnd: latestStr,
        daysOnCampus: sortDays(Array.from(daysSet)),
      });
      return;
    }

    const { sections } = courseOptions[courseIndex];
    for (const section of sections) {
      const conflictsWithCurrent = currentSections.some((s) => sectionsConflict(s, section));
      if (!conflictsWithCurrent) {
        currentSections.push(section);
        buildCombination(courseIndex + 1, currentSections);
        currentSections.pop();
      }
    }
  }

  buildCombination(0, []);
  return validSchedules;
}

export function sortSchedules(
  schedules: GeneratedSchedule[],
  sortBy: SortOption
): GeneratedSchedule[] {
  const sorted = [...schedules];
  switch (sortBy) {
    case 'earliest':
      sorted.sort((a, b) => parseTime(a.earliestStart) - parseTime(b.earliestStart));
      break;
    case 'latest':
      sorted.sort((a, b) => parseTime(b.earliestStart) - parseTime(a.earliestStart));
      break;
    case 'fewest_days':
      sorted.sort((a, b) => a.daysOnCampus.length - b.daysOnCampus.length);
      break;
    case 'most_open_seats':
      sorted.sort((a, b) => {
        const seatsA = a.sections.reduce((sum, s) => sum + s.seats_available, 0);
        const seatsB = b.sections.reduce((sum, s) => sum + s.seats_available, 0);
        return seatsB - seatsA;
      });
      break;
  }
  return sorted;
}
