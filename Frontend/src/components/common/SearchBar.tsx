import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchCourses } from '../../utils/api';
import { useScheduleStore } from '../../store/scheduleStore';
import type { CourseListItem } from '../../types';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  onSelect?: (course: CourseListItem) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ onSelect, placeholder, className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CourseListItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { term } = useScheduleStore();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || !term) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchCourses(term, query.trim(), { limit: 10 });
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, term]);

  function handleSelect(course: CourseListItem) {
    setShowDropdown(false);
    setQuery('');
    if (onSelect) {
      onSelect(course);
    } else {
      navigate(`/course/${course.subject}/${course.course_number}`);
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || 'Search courses (e.g., CS2500, programming)...'}
          className="w-full h-10 pl-10 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No courses found</div>
          ) : (
            results.map((course) => (
              <button
                key={course.subject_course}
                onClick={() => handleSelect(course)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-gray-900">
                      {course.subject} {course.course_number}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">{course.credits} cr</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {course.open_section_count}/{course.section_count} open
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{course.course_title}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
