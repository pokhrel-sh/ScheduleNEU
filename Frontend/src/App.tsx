import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import SearchPage from './Pages/SearchPage';
import CourseDetailPage from './Pages/CourseDetailPage';
import SchedulePage from './Pages/SchedulePage';
import GeneratorPage from './Pages/GeneratorPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout><SearchPage /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/course/:subject/:number" element={<Layout><CourseDetailPage /></Layout>} />
          <Route path="/schedule" element={<Layout><SchedulePage /></Layout>} />
          <Route path="/generate" element={<Layout><GeneratorPage /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}
