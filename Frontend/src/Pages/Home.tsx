import { useState } from 'react';
import { Search, Info } from 'lucide-react';
import logo from "../assets/Logo.jpeg"

export default function Home() {
  const [selectedSemester, setSelectedSemester] = useState('Fall 2025 Semester');
  const [activeTab, setActiveTab] = useState('NEU');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'NEU', name: 'NEU', icon: '🎓' },
    { id: 'CPS', name: 'CPS', icon: '📏' },
    { id: 'Law', name: 'Law', icon: '⚖️' }
  ];

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 text-center">
        <p className="font-semibold text-lg">
          🚧 Coming Soon - Currently Under Development 🚧
        </p>
      </div>

      <div className="px-6 py-4">
      <a 
          href="https://shishirpokhrel.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block"
        >
          <div className="flex items-center space-x-2">
            <img 
              src={logo}
              alt="Logo" 
              className="w-8 h-8 rounded object-cover"
            />
          </div>
        </a>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-red-500">Schedule</span>
            <span className="text-blue-900">Northeastern</span>
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-blue-800 font-medium">
              Best experience if used together with {' '}
              <a 
                href="https://searchneu.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
              >
                SearchNEU.com
              </a>
            </p>
          </div>
        </div>

        {/* Search interface */}
        <div className="w-full max-w-4xl bg-gray-300 rounded-lg p-8 shadow-sm mt-8">
          {/* Tabs */}
          <div className="flex space-x-0 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm flex items-center space-x-2 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-red-500 border-red-500 bg-white'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Search form */}
          <div className="flex space-x-4">
            {/* Semester dropdown */}
            <div className="flex-shrink-0">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="h-12 px-4 bg-white border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="Fall 2025 Semester">Fall 2025 Semester</option>
                <option value="Spring 2025 Semester">Spring 2025 Semester</option>
                <option value="Summer 2025 Semester">Summer 2025 Semester</option>
              </select>
            </div>

            {/* Search input */}
            <div className="flex-grow relative bg-gray-400">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Example: BIO4520 [or] CS4500 [or] THTR1125'
                className="w-full h-12 px-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Search button */}
            <button className="h-12 px-6 bg-red-500 text-white rounded-r hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
              <Search size={20} />
            </button>

            {/* Info button */}
            <button className="h-12 w-12 bg-gray-300 rounded flex items-center justify-center hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              <Info size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 max-w-3xl text-center">
          <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
            <strong>Disclaimer:</strong> This application is designed to work hand-in-hand with{' '}
            <a 
              href="https://searchneu.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              SearchNEU.com
            </a>
            {' '}and in no way affilitated or tries to replace their excellent work. The similar design decisions are intentional to provide a familiar user experience for easier navigation and use.
            <br />
            Built by {' '}
            <a 
              href="https://searchneu.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              shishirpokhrel.com
            </a>
            {' '}
          </p>
        </div>
      </div>
    </div>
  );
}