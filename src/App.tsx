// src/App.tsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProgressProvider } from './contexts/ProgressContext';   // ← 新增

import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SearchPage from './pages/SearchPage';
import GraphPage from './pages/GraphPage';
import ExamPage from './pages/ExamPage';
import TemplatePage from './pages/TemplatePage';
import ChangelogPage from './pages/ChangelogPage';
import ReviewPage from './pages/ReviewPage';
import QuickQuizPage from './pages/QuickQuizPage';

export default function App() {
  return (
    <HashRouter>
      <ProgressProvider>                    {/* ← 包裹所有页面 */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/subject/:subjectId" element={<SubjectPage />} />
          <Route path="/flashcards/:subjectId" element={<FlashcardsPage />} />
          <Route path="/graph/:subjectId" element={<GraphPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/template" element={<TemplatePage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/quick" element={<QuickQuizPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProgressProvider>
    </HashRouter>
  );
}