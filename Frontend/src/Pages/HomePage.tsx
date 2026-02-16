import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Layers, ArrowRight } from 'lucide-react';
import logo from '../assets/Logo.jpeg';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="ScheduleNEU" className="w-16 h-16 rounded-lg object-cover" />
          </div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-red-600">Schedule</span>
            <span className="text-blue-900">NEU</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Build the perfect class schedule. Search courses, compare sections, and generate
            conflict-free schedules automatically.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <button
            onClick={() => navigate('/search')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md hover:border-red-200 transition-all group"
          >
            <Search size={24} className="text-red-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Search Courses</h3>
            <p className="text-sm text-gray-500">Browse the course catalog and view section details</p>
            <div className="flex items-center gap-1 mt-3 text-sm text-red-600 font-medium group-hover:gap-2 transition-all">
              <span>Get started</span>
              <ArrowRight size={14} />
            </div>
          </button>

          <button
            onClick={() => navigate('/schedule')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md hover:border-red-200 transition-all group"
          >
            <Calendar size={24} className="text-red-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">View Schedule</h3>
            <p className="text-sm text-gray-500">See your selected courses on a weekly calendar</p>
            <div className="flex items-center gap-1 mt-3 text-sm text-red-600 font-medium group-hover:gap-2 transition-all">
              <span>Open calendar</span>
              <ArrowRight size={14} />
            </div>
          </button>

          <button
            onClick={() => navigate('/generate')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md hover:border-red-200 transition-all group"
          >
            <Layers size={24} className="text-red-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Generate Schedules</h3>
            <p className="text-sm text-gray-500">Auto-generate conflict-free schedule combinations</p>
            <div className="flex items-center gap-1 mt-3 text-sm text-red-600 font-medium group-hover:gap-2 transition-all">
              <span>Generate</span>
              <ArrowRight size={14} />
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="text-center">
          <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-800">
              Works alongside{' '}
              <a
                href="https://searchneu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                SearchNEU.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
