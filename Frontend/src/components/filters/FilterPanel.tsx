import { RotateCcw } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';

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

export default function FilterPanel() {
  const { filters, setFilters, resetFilters } = useScheduleStore();

  function toggleDay(day: string, list: 'excludeDays' | 'daysFilter') {
    const current = filters[list];
    if (current.includes(day)) {
      setFilters({ [list]: current.filter((d) => d !== day) });
    } else {
      setFilters({ [list]: [...current, day] });
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-800">Filters</h3>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Availability */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Availability</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showOpenOnly}
              onChange={(e) => setFilters({ showOpenOnly: e.target.checked })}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Open sections only</span>
          </label>
          <div className="mt-2">
            <label className="text-xs text-gray-500">Min seats available</label>
            <input
              type="number"
              min={0}
              value={filters.minSeatsAvailable}
              onChange={(e) => setFilters({ minSeatsAvailable: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Time */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Time</p>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500">No classes before</label>
              <select
                value={filters.startTimeAfter || ''}
                onChange={(e) => setFilters({ startTimeAfter: e.target.value || null })}
                className="mt-1 w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
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
                value={filters.endTimeBefore || ''}
                onChange={(e) => setFilters({ endTimeBefore: e.target.value || null })}
                className="mt-1 w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
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
          <div className="flex gap-1">
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleDay(key, 'excludeDays')}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  filters.excludeDays.includes(key)
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
            value={filters.professorSearch}
            onChange={(e) => setFilters({ professorSearch: e.target.value })}
            placeholder="Search by name..."
            className="w-full h-8 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>
    </div>
  );
}
