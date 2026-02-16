import { Lock, Plus } from 'lucide-react';
import type { SectionDisplay } from '../../types';
import { seatColorClass, expandDays } from '../../utils/timeUtils';

const ALL_DAYS = ['M', 'T', 'W', 'R', 'F'];

interface SectionRowProps {
  section: SectionDisplay;
  onAddSection?: (section: SectionDisplay) => void;
  isLocked?: boolean;
}

export default function SectionRow({ section, onAddSection, isLocked }: SectionRowProps) {
  const sectionDays = new Set(expandDays(section.days));
  const seatColor = seatColorClass(section.seats_available, section.max_enrollment);

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 ${!section.is_open ? 'opacity-60' : ''}`}>
      <td className="px-3 py-2.5">
        {onAddSection && (
          <button
            onClick={() => onAddSection(section)}
            disabled={isLocked}
            className={`p-1 rounded transition-colors ${
              isLocked
                ? 'text-red-600 bg-red-50'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title={isLocked ? 'Locked to this section' : 'Lock to this section'}
          >
            {isLocked ? <Lock size={16} /> : <Plus size={16} />}
          </button>
        )}
      </td>
      <td className="px-3 py-2.5 text-sm font-mono text-gray-700">{section.crn}</td>
      <td className={`px-3 py-2.5 text-sm font-medium ${seatColor}`}>
        {section.seats_available}/{section.max_enrollment}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex gap-0.5">
          {ALL_DAYS.map((d) => (
            <span
              key={d}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs font-medium ${
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
      <td className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap">
        {section.start_time} - {section.end_time}
      </td>
      <td className="px-3 py-2.5 text-sm text-gray-600">
        {section.building ? `${section.building} ${section.room}` : section.room || 'TBA'}
      </td>
      <td className="px-3 py-2.5 text-sm text-gray-700">{section.professor || 'TBA'}</td>
      <td className="px-3 py-2.5">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {section.campus || 'N/A'}
        </span>
      </td>
      <td className="px-3 py-2.5">
        {section.is_open ? (
          <span className="text-xs font-medium text-green-600">Open</span>
        ) : (
          <span className="text-xs font-medium text-red-500">Closed</span>
        )}
      </td>
    </tr>
  );
}
