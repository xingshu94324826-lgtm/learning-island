import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SearchPage from './pages/SearchPage';
import GraphPage from './pages/GraphPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/subject/:subjectId" element={<SubjectPage />} />
        <Route path="/flashcards/:subjectId" element={<FlashcardsPage />} />
        <Route path="/graph/:subjectId" element={<GraphPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
