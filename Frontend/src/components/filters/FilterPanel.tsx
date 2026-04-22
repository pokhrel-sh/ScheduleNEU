import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';
import type { FilterState } from '../../types';

const TIME_OPTIONS = [
  '7:00am', '8:00am', '9:00am', '10:00am', '11:00am', '12:00pm',
  '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm', '6:00pm',
  '7:00pm', '8:00pm', '9:00pm',
];

const DAYS = [
  { key: 'M', label: 'M' },
  { key: 'T', label: 'T' },
  { key: 'W', label: 'W' },
  { key: 'R', label: 'R' },
  { key: 'F', label: 'F' },
  { key: 'S', label: 'S' },
  { key: 'U', label: 'U' },
];

const DEFAULT_FILTERS: FilterState = {
  showOpenOnly: true,
  startTimeAfter: null,
  endTimeBefore: null,
  daysFilter: [],
  excludeDays: [],
  campusFilter: [],
  instructionalMethod: [],
  professorSearch: '',
  minSeatsAvailable: 0,
};

interface FilterPanelProps {
  onApply?: () => void;
}

export default function FilterPanel({ onApply }: FilterPanelProps) {
  const { filters: storeFilters, setFilters, resetFilters } = useScheduleStore();
  const [local, setLocal] = useState<FilterState>({ ...storeFilters });

  useEffect(() => {
    setLocal({ ...storeFilters });
  }, [storeFilters]);

  function updateLocal(partial: Partial<FilterState>) {
    setLocal((prev) => ({ ...prev, ...partial }));
  }

  function toggleDay(day: string) {
    const current = local.excludeDays;
    if (current.includes(day)) {
      updateLocal({ excludeDays: current.filter((d) => d !== day) });
    } else {
      updateLocal({ excludeDays: [...current, day] });
    }
  }

  function handleApply() {
    setFilters(local);
    onApply?.();
  }

  function handleReset() {
    resetFilters();
    setLocal({ ...DEFAULT_FILTERS });
  }

  const isDirty = JSON.stringify(local) !== JSON.stringify(storeFilters);

  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200">
        <h3 className="font-semibold text-base text-gray-800">Filters</h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Availability */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Availability</p>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={local.showOpenOnly}
              onChange={(e) => updateLocal({ showOpenOnly: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Open sections only</span>
          </label>
          <div className="mt-2.5">
            <label className="text-xs text-gray-500">Min seats available</label>
            <input
              type="number"
              min={0}
              value={local.minSeatsAvailable}
              onChange={(e) => updateLocal({ minSeatsAvailable: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Time */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Time</p>
          <div className="space-y-2.5">
            <div>
              <label className="text-xs text-gray-500">No classes before</label>
              <select
                value={local.startTimeAfter || ''}
                onChange={(e) => updateLocal({ startTimeAfter: e.target.value || null })}
                className="mt-1 w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">Any time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">No classes after</label>
              <select
                value={local.endTimeBefore || ''}
                onChange={(e) => updateLocal({ endTimeBefore: e.target.value || null })}
                className="mt-1 w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">Any time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Days */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Exclude Days</p>
          <div className="flex gap-1.5">
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleDay(key)}
                className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                  local.excludeDays.includes(key)
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Professor */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Professor</p>
          <input
            type="text"
            value={local.professorSearch}
            onChange={(e) => updateLocal({ professorSearch: e.target.value })}
            placeholder="Search by name..."
            className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Apply button */}
      <div className="px-4 py-3.5 border-t border-gray-200">
        <button
          onClick={handleApply}
          className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            isDirty
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
