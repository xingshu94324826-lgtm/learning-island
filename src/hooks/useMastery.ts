import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

export interface ChapterMastery {
  subjectId: string;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  score: number;           // 0-100
  weakTotal: number;
  weakResolved: number;
  fcTotal: number;
  fcWeak: number;          // still in weak pool
}

export interface SubjectMastery {
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  score: number;           // 0-100
  chapters: ChapterMastery[];
}

const EMPTY_RECORD: Record<string, string[]> = {};

export function useMastery() {
  const [checkedMap] = useLocalStorage<Record<string, string[]>>('weak-pts-all', EMPTY_RECORD);
  const [weakPool] = useLocalStorage<string[]>('fc-weak-pool', []);

  return useMemo(() => {
    const subjects: SubjectMastery[] = data.subjects.map(sub => {
      const chapters: ChapterMastery[] = sub.chapters.map(ch => {
        // Weak points
        const checked = checkedMap[`weak-pts-${sub.id}`] || [];
        const weakResolved = ch.weakPoints.filter(wp => checked.includes(wp)).length;
        const weakTotal = ch.weakPoints.length;
        const weakScore = weakTotal > 0 ? (weakResolved / weakTotal) * 50 : 25;

        // Flashcard weak pool for this chapter
        const chCards = data.flashcards.filter(fc => fc.chapterId === ch.id);
        const chWeakCards = chCards.filter(fc => weakPool.includes(fc.id));
        const fcTotal = chCards.length;
        const fcWeak = chWeakCards.length;
        // If no cards for this chapter, give neutral; if all cards mastered, full; else proportional
        const fcScore = fcTotal > 0 ? ((fcTotal - fcWeak) / fcTotal) * 50 : 25;

        const score = Math.round(weakScore + fcScore);

        return {
          subjectId: sub.id,
          chapterId: ch.id,
          chapterOrder: ch.order,
          chapterTitle: ch.title,
          score,
          weakTotal,
          weakResolved,
          fcTotal,
          fcWeak,
        };
      });

      const avgScore = chapters.length > 0
        ? Math.round(chapters.reduce((s, c) => s + c.score, 0) / chapters.length)
        : 0;

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectIcon: sub.icon,
        score: avgScore,
        chapters,
      };
    });

    const overallScore = subjects.length > 0
      ? Math.round(subjects.reduce((s, sub) => s + sub.score, 0) / subjects.length)
      : 0;

    const totalWeakRemaining = subjects.reduce((s, sub) =>
      s + sub.chapters.reduce((cs, ch) => cs + (ch.weakTotal - ch.weakResolved), 0), 0);

    const totalFcWeak = weakPool.length;

    const weakestChapter = subjects
      .flatMap(s => s.chapters)
      .filter(c => c.score < 100)
      .sort((a, b) => a.score - b.score)[0] || null;

    return {
      subjects,
      overallScore,
      totalWeakRemaining,
      totalFcWeak,
      weakestChapter,
      weakPool,
    };
  }, [checkedMap, weakPool]);
}
