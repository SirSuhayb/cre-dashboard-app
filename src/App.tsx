import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CREDashboard from './CREDashboard';
import PropertyDetail from './PropertyDetail';
import ClientDetail from './ClientDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CREDashboard />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/client/:id" element={<ClientDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
