import { CheckSquare, Square } from 'lucide-react';
import type { SectionDisplay } from '../../types';
import { seatColorClass, expandDays } from '../../utils/timeUtils';

const ALL_DAYS = ['M', 'T', 'W', 'R', 'F'];

interface SectionRowProps {
  section: SectionDisplay;
  onToggleSection?: (section: SectionDisplay) => void;
  isSelected?: boolean;
}

export default function SectionRow({ section, onToggleSection, isSelected }: SectionRowProps) {
  const sectionDays = new Set(expandDays(section.days));
  const seatColor = seatColorClass(section.seats_available, section.max_enrollment);

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 ${!section.is_open ? 'opacity-60' : ''}`}>
      <td className="px-3 py-3">
        {onToggleSection && (
          <button
            onClick={() => onToggleSection(section)}
            className={`p-1.5 rounded transition-colors ${
              isSelected
                ? 'text-red-600 bg-red-50'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title={isSelected ? 'Deselect section' : 'Select section'}
          >
            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>
        )}
      </td>
      <td className="px-3 py-3 text-sm font-mono text-gray-700">{section.crn}</td>
      <td className={`px-3 py-3 text-sm font-medium ${seatColor}`}>
        {section.seats_available}/{section.max_enrollment}
      </td>
      <td className="px-3 py-3">
        <div className="flex gap-0.5">
          {ALL_DAYS.map((d) => (
            <span
              key={d}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium ${
                sectionDays.has(d)
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">
        {section.start_time} - {section.end_time}
      </td>
      <td className="px-3 py-3 text-sm text-gray-600">
        {section.building ? `${section.building} ${section.room}` : section.room || 'TBA'}
      </td>
      <td className="px-3 py-3 text-sm text-gray-700">{section.professor || 'TBA'}</td>
      <td className="px-3 py-3">
        <span className="text-sm px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {section.campus || 'N/A'}
        </span>
      </td>
      <td className="px-3 py-3">
        {section.is_open ? (
          <span className="text-sm font-medium text-green-600">Open</span>
        ) : (
          <span className="text-sm font-medium text-red-500">Closed</span>
        )}
      </td>
    </tr>
  );
}
