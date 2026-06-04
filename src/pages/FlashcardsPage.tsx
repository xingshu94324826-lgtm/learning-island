import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Select } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import FlashCard from '../components/FlashCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

type FilterMode = 'all' | 'weak';

export default function FlashcardsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterSubject, setFilterSubject] = useState(subjectId || 'all');
  const [searchParams] = useSearchParams();
  const [filterMode, setFilterMode] = useState<FilterMode>(
    searchParams.get('mode') === 'weak' ? 'weak' : 'all'
  );
  const [weakPool, setWeakPool] = useLocalStorage<string[]>('fc-weak-pool', []);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // All cards for subject
  const subjectCards = useMemo(() => {
    if (filterSubject === 'all') return data.flashcards;
    return data.flashcards.filter(fc => fc.id.startsWith(filterSubject));
  }, [filterSubject]);

  // Apply weak filter
  const filteredCards = useMemo(() => {
    if (filterMode === 'weak') {
      return subjectCards.filter(fc => weakPool.includes(fc.id));
    }
    return subjectCards;
  }, [subjectCards, filterMode, weakPool]);

  const currentCard = filteredCards[currentIndex];

  const subjectOptions = [
    { key: 'all', label: '全部科目' },
    ...data.subjects.map(s => ({ key: s.id, label: `${s.icon} ${s.name}` })),
  ];

  const modeOptions = [
    { key: 'all', label: `全部 (${subjectCards.length})` },
    { key: 'weak', label: `弱项 (${subjectCards.filter(c => weakPool.includes(c.id)).length})` },
  ];

  const handleCorrect = () => {
    setCorrectCount(c => c + 1);
    // Remove from weak pool if it was weak
    if (weakPool.includes(currentCard.id)) {
      setWeakPool(prev => prev.filter(id => id !== currentCard.id));
    }
    nextCard();
  };

  const handleWrong = () => {
    setWrongCount(c => c + 1);
    // Add to weak pool
    if (!weakPool.includes(currentCard.id)) {
      setWeakPool(prev => [...prev, currentCard.id]);
    }
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
  };

  const isFinished = filteredCards.length === 0 || currentIndex >= filteredCards.length - 1;

  return (
    <AppShell>
      {/* Top controls */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16,
        flexWrap: 'wrap', justifyContent: 'space-between',
      }}>
        <Button type="text" onClick={() => navigate('/')}>← 返回</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Select value={filterSubject} onChange={(k) => { setFilterSubject(k); setCurrentIndex(0); setCorrectCount(0); setWrongCount(0); }} options={subjectOptions} />
          <Select value={filterMode} onChange={(k) => { setFilterMode(k as FilterMode); setCurrentIndex(0); setCorrectCount(0); setWrongCount(0); }} options={modeOptions} />
        </div>
      </div>

      {/* Empty weak pool */}
      {filterMode === 'weak' && filteredCards.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>弱项池已清空！</div>
            <div style={{ fontSize: 12, color: 'var(--animal-text-color-secondary, #9f927d)', marginTop: 4 }}>
              所有不确定的卡片都已掌握
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button type="primary" onClick={() => setFilterMode('all')}>回到全部</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty all */}
      {filterMode === 'all' && filteredCards.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>该科目暂无闪卡</div>
            <Button type="primary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </Card>
      )}

      {/* Active card */}
      {currentCard && (
        <>
          <FlashCard
            key={currentCard.id}
            question={currentCard.question}
            answer={currentCard.answer}
            index={currentIndex}
            total={filteredCards.length}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
          />

          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16,
            fontSize: 13, color: 'var(--animal-text-color-secondary, #9f927d)',
          }}>
            <span>✅ {correctCount}</span>
            <span>❌ {wrongCount}</span>
            <span>📊 {correctCount + wrongCount > 0 ? Math.round(correctCount / (correctCount + wrongCount) * 100) : 0}%</span>
            <span>📦 弱项池 {weakPool.length}</span>
          </div>
        </>
      )}

      {/* Finished */}
      {isFinished && filteredCards.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Card color="app-green">
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>本轮完成</div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.8 }}>
              ✅ {correctCount}  ❌ {wrongCount}
              {filterMode === 'weak' && weakPool.length === 0 ? ' — 弱项全部清除！' : ''}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button type="primary" onClick={reset}>🔄 再来一轮</Button>
              {filterMode === 'all' && weakPool.length > 0 && (
                <Button type="default" onClick={() => { setFilterMode('weak'); reset(); }}>
                  🎯 专项攻克弱项 ({weakPool.length})
                </Button>
              )}
              <Button type="default" onClick={() => navigate('/')}>🏠 返回首页</Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
