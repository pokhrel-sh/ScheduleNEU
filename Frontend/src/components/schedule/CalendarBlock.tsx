import type { SectionDisplay } from '../../types';

const COURSE_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800' },
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
];

export function getColorForIndex(index: number) {
  return COURSE_COLORS[index % COURSE_COLORS.length];
}

interface CalendarBlockProps {
  section: SectionDisplay;
  courseLabel: string;
  colorIndex: number;
  top: number;
  height: number;
}

export default function CalendarBlock({
  section,
  courseLabel,
  colorIndex,
  top,
  height,
}: CalendarBlockProps) {
  const color = getColorForIndex(colorIndex);
  const compact = height < 50;

  return (
    <div
      className={`absolute left-0.5 right-0.5 ${color.bg} ${color.border} border rounded-md px-1.5 py-1 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
      style={{ top: `${top}px`, height: `${height}px` }}
      title={`${courseLabel}\n${section.start_time} - ${section.end_time}\n${section.building ? `${section.building} ${section.room}` : section.room}\n${section.professor}`}
    >
      <p className={`font-semibold truncate ${color.text} ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {courseLabel}
      </p>
      {!compact && (
        <>
          <p className="text-[10px] text-gray-600 truncate">
            {section.start_time}-{section.end_time}
          </p>
          {height >= 60 && (
            <p className="text-[10px] text-gray-500 truncate">
              {section.building ? `${section.building} ${section.room}` : section.room || ''}
            </p>
          )}
          {height >= 75 && (
            <p className="text-[10px] text-gray-500 truncate">{section.professor}</p>
          )}
        </>
      )}
    </div>
  );
}
