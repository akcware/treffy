import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CallPage from './pages/CallPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/call/:roomId" element={<CallPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
