import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/index';
import Footer from './components/Footer/index';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Electricity from './pages/Electricity';
import SelfAuditElectricity from './pages/SelfAuditElectricity';
import Water from './pages/Water';
import Waste from './pages/Waste';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/electricity" element={<Electricity />} />
        <Route path="/electricityaudit" element={<SelfAuditElectricity />} />
        <Route path="/water" element={<Water />} />
        <Route path="/waste" element={<Waste />} />
      </Routes>
      <Footer />
    </Router>
  );
}
