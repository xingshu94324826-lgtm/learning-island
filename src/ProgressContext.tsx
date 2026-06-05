// src/contexts/ProgressContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface UserNote {
  id: string;
  content: string;
  updatedAt: string;
}

export interface KnowledgeProgress {
  mastery: MasteryLevel;
  notes: UserNote[];
  lastReviewed: string;
}

interface ProgressContextType {
  progress: Record<string, KnowledgeProgress>;
  updateMastery: (kpId: string, level: MasteryLevel) => void;
  addNote: (kpId: string, content: string) => void;
  deleteNote: (kpId: string, noteId: string) => void;
  getOverallProgress: () => number;
  getWeakPoints: (limit?: number) => Array<{ id: string; title?: string; mastery: MasteryLevel }>;
  getChapterProgress: (chapterId: string) => number;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Record<string, KnowledgeProgress>>(() => {
    try {
      const saved = localStorage.getItem('learning_island_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('learning_island_progress', JSON.stringify(progress));
  }, [progress]);

  const updateMastery = (kpId: string, level: MasteryLevel) => {
    setProgress(prev => ({
      ...prev,
      [kpId]: {
        mastery: level,
        notes: prev[kpId]?.notes || [],
        lastReviewed: new Date().toISOString(),
      },
    }));
  };

  const addNote = (kpId: string, content: string) => {
    if (!content.trim()) return;
    const note: UserNote = {
      id: Date.now().toString(36),
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    };
    setProgress(prev => ({
      ...prev,
      [kpId]: {
        ...prev[kpId],
        mastery: prev[kpId]?.mastery || 0,
        notes: [...(prev[kpId]?.notes || []), note],
        lastReviewed: new Date().toISOString(),
      },
    }));
  };

  const deleteNote = (kpId: string, noteId: string) => {
    setProgress(prev => {
      const current = prev[kpId];
      if (!current) return prev;
      return {
        ...prev,
        [kpId]: {
          ...current,
          notes: current.notes.filter(n => n.id !== noteId),
        },
      };
    });
  };

  const getOverallProgress = (): number => {
    const entries = Object.values(progress);
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, p) => sum + p.mastery, 0);
    return Math.round((total / (entries.length * 5)) * 100);
  };

  const getWeakPoints = (limit = 5) => {
    return Object.entries(progress)
      .filter(([, p]) => p.mastery <= 2 && p.mastery > 0)
      .sort((a, b) => a[1].mastery - b[1].mastery)
      .slice(0, limit)
      .map(([id, p]) => ({ id, title: '', mastery: p.mastery }));
  };

  const getChapterProgress = (chapterId: string): number => 0; // 后续根据实际数据增强

  const resetProgress = () => {
    if (window.confirm('确定要重置所有学习进度吗？')) {
      setProgress({});
      localStorage.removeItem('learning_island_progress');
    }
  };

  return (
    <ProgressContext.Provider value={{
      progress,
      updateMastery,
      addNote,
      deleteNote,
      getOverallProgress,
      getWeakPoints,
      getChapterProgress,
      resetProgress,
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};