import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cart from './Pages/Cart';
import LandingPage from './Pages/LandingPage';
import Schedule from './Pages/Schedule';
import SearchPage from './Pages/Search/SearchPage';
import ResultPage from './Pages/SearchResult/ResultPage';
import Tutorials from './Pages/Tutorials/Tutorials';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Tutorials />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/schedule" element={<Schedule />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/result" element={<ResultPage />} />
    <Route path="/tutorials" element={<Tutorials />} />
  </Routes>
  
);

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
