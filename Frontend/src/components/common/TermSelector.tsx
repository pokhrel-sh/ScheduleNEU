import { useEffect } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import { useApi } from '../../hooks/useApi';
import { getTerms } from '../../utils/api';

export default function TermSelector() {
  const { term, setTerm } = useScheduleStore();
  const { data: terms, loading } = useApi(getTerms);

  useEffect(() => {
    if (terms && terms.length > 0 && !term) {
      setTerm(terms[0].term);
    }
  }, [terms, term, setTerm]);

  if (loading || !terms) {
    return (
      <div className="h-9 w-48 bg-gray-100 rounded animate-pulse" />
    );
  }

  return (
    <select
      value={term}
      onChange={(e) => setTerm(e.target.value)}
      className="h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
    >
      {terms.map((t) => (
        <option key={t.term} value={t.term}>
          {t.term_description || t.term}
        </option>
      ))}
    </select>
  );
}
