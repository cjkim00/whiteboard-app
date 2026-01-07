import React from 'react';
import logo from './logo.svg';
import './App.css';
import './routes/Whiteboard';
import Whiteboard from './routes/Whiteboard';
import { HashRouter , Routes, Route } from "react-router-dom";
import LandingPage from './routes/LandingPage';
function App() {
  return (
    <HashRouter >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/board" element={<Whiteboard />} />
      </Routes>
    </HashRouter >
  );
}

export default App;
