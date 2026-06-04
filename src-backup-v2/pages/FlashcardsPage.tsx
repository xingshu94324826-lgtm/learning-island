import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Select } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import FlashCard from '../components/FlashCard';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

export default function FlashcardsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterSubject, setFilterSubject] = useState(subjectId || 'all');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Filter flashcards
  const filteredCards = useMemo(() => {
    if (filterSubject === 'all') return data.flashcards;
    return data.flashcards.filter(fc => fc.id.startsWith(filterSubject));
  }, [filterSubject]);

  const currentCard = filteredCards[currentIndex];

  const subjectOptions = [
    { key: 'all', label: '全部科目' },
    ...data.subjects.map(s => ({ key: s.id, label: `${s.icon} ${s.name}` })),
  ];

  const handleCorrect = () => {
    setCorrectCount(c => c + 1);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleWrong = () => {
    setWrongCount(c => c + 1);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
  };

  if (filteredCards.length === 0) {
    return (
      <AppShell>
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>该科目暂无闪卡</div>
            <Button type="primary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const isFinished = currentIndex >= filteredCards.length - 1;

  return (
    <AppShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Button type="text" onClick={() => navigate('/')}>← 返回</Button>
        <Select value={filterSubject} onChange={setFilterSubject} options={subjectOptions} />
      </div>

      {currentCard ? (
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

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16,
            fontSize: 13, color: 'var(--animal-text-color-secondary, #9f927d)',
          }}>
            <span>✅ 掌握: {correctCount}</span>
            <span>❌ 不确定: {wrongCount}</span>
            <span>📊 正确率: {correctCount + wrongCount > 0 ? Math.round(correctCount / (correctCount + wrongCount) * 100) : 0}%</span>
          </div>
        </>
      ) : null}

      {isFinished && currentIndex >= filteredCards.length - 1 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Card color="app-green">
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>本轮完成！</div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.8 }}>
              掌握 {correctCount} / 不确定 {wrongCount}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button type="primary" onClick={reset}>🔄 再来一轮</Button>
              <Button type="default" onClick={() => navigate('/')}>🏠 返回首页</Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
