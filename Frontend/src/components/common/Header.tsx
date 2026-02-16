import { Link, useLocation } from 'react-router-dom';
import { Calendar, Search, Layers } from 'lucide-react';
import logo from '../../assets/Logo.jpeg';
import TermSelector from './TermSelector';

const NAV_ITEMS = [
  { path: '/search', label: 'Search', icon: Search },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/generate', label: 'Generate', icon: Layers },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logo} alt="Logo" className="w-7 h-7 rounded object-cover" />
              <span className="font-bold text-lg hidden sm:inline">
                <span className="text-red-600">Schedule</span>
                <span className="text-blue-900">NEU</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const active = location.pathname.startsWith(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <TermSelector />
        </div>
      </div>
    </header>
  );
}
