import type { SectionDisplay } from '../../types';
import SectionRow from './SectionRow';

interface SectionTableProps {
  sections: SectionDisplay[];
  onToggleSection?: (section: SectionDisplay) => void;
  selectedCrns?: string[];
}

export default function SectionTable({ sections, onToggleSection, selectedCrns = [] }: SectionTableProps) {
  if (sections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No sections match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase w-10" />
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">CRN</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Seats</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Days</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Professor</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Campus</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <SectionRow
              key={section.crn}
              section={section}
              onToggleSection={onToggleSection}
              isSelected={selectedCrns.includes(section.crn)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
