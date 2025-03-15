import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cart from './Pages/Cart';
import LandingPage from './Pages/LandingPage';
import Schedule from './Pages/Schedule';
import SearchPage from './Pages/SearchPage';
import ResultPage from './Pages/ResultPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/schedule" element={<Schedule />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/result" element={<ResultPage />} />
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
