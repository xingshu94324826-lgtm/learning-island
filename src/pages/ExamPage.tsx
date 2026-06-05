import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import FlashCard from '../components/FlashCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { examItems, groupByYear } from '../data/examData';

type ExamMode = 'list' | 'quiz';
type FilterMode = 'all' | 'weak';

export default function ExamPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ExamMode>('list');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [showAnswers, setShowAnswers] = useState(false);

  // Quiz mode state
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weakPool, setWeakPool] = useLocalStorage<string[]>('exam-weak-pool', []);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const yearMap = useMemo(() => groupByYear(examItems), []);
  const years = useMemo(() => [...yearMap.keys()].sort((a, b) => b - a), [yearMap]);

  // Quiz: filtered cards
  const quizCards = useMemo(() => {
    let cards = [...examItems].reverse(); // oldest first → reverse to newest first
    if (selectedYear !== 'all') {
      cards = cards.filter(item => item.year === selectedYear);
    }
    if (filterMode === 'weak') {
      cards = cards.filter(item => weakPool.includes(item.id));
    }
    return cards;
  }, [selectedYear, filterMode, weakPool]);

  const currentCard = quizCards[currentIndex];
  const isFinished = quizCards.length === 0 || currentIndex >= quizCards.length;

  // List: displayed items
  const displayedItems = useMemo(() => {
    if (selectedYear === 'all') return examItems;
    return yearMap.get(selectedYear) || [];
  }, [selectedYear, yearMap]);

  const handleCorrect = () => {
    setCorrectCount(c => c + 1);
    if (weakPool.includes(currentCard.id)) {
      setWeakPool(prev => prev.filter(id => id !== currentCard.id));
    }
    nextCard();
  };

  const handleWrong = () => {
    setWrongCount(c => c + 1);
    if (!weakPool.includes(currentCard.id)) {
      setWeakPool(prev => [...prev, currentCard.id]);
    }
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < quizCards.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
  };

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Button type="text" onClick={() => navigate('/')}>← 返回</Button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--animal-text-color, #794f27)' }}>
          📝 真题练习 · 名词解释
        </h2>
      </div>

      {/* Mode switch */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div style={{
          display: 'flex', background: 'var(--animal-border-color-light, #e8e2d6)',
          borderRadius: 12, padding: 3, gap: 2,
        }}>
          <button onClick={() => setMode('list')} style={{
            padding: '6px 14px', borderRadius: 10, border: 'none',
            fontSize: 12, fontWeight: mode === 'list' ? 700 : 500, cursor: 'pointer',
            background: mode === 'list' ? '#fff' : 'transparent',
            color: mode === 'list' ? 'var(--animal-text-color, #794f27)' : 'var(--animal-text-color-secondary, #9f927d)',
            boxShadow: mode === 'list' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
          }}>
            📋 列表浏览
          </button>
          <button onClick={() => setMode('quiz')} style={{
            padding: '6px 14px', borderRadius: 10, border: 'none',
            fontSize: 12, fontWeight: mode === 'quiz' ? 700 : 500, cursor: 'pointer',
            background: mode === 'quiz' ? '#fff' : 'transparent',
            color: mode === 'quiz' ? 'var(--animal-text-color, #794f27)' : 'var(--animal-text-color-secondary, #9f927d)',
            boxShadow: mode === 'quiz' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
          }}>
            🎴 逐题挑战
          </button>
        </div>
      </div>

      {/* Year selector (shared) */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button key="all" type={selectedYear === 'all' ? 'primary' : 'default'} size="small"
          onClick={() => { setSelectedYear('all'); resetQuiz(); }}>
          全部 ({examItems.length})
        </Button>
        {years.map(y => (
          <Button key={y} type={selectedYear === y ? 'primary' : 'default'} size="small"
            onClick={() => { setSelectedYear(y); resetQuiz(); }}>
            {y}年 ({yearMap.get(y)?.length || 0})
          </Button>
        ))}
      </div>

      {/* ========== LIST MODE ========== */}
      {mode === 'list' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button type={showAnswers ? 'default' : 'primary'} size="small" onClick={() => setShowAnswers(!showAnswers)}>
              {showAnswers ? '🙈 隐藏全部答案' : '👁 显示全部答案'}
            </Button>
            <span style={{ fontSize: 11, color: 'var(--animal-text-color-secondary, #9f927d)', marginLeft: 8 }}>
              建议：先遮住答案，自己写一遍，再对照
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayedItems.map((item, idx) => (
              <Card key={`${item.year}-${item.term}-${idx}`} color="default">
                <div style={{ padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6,
                      background: 'var(--animal-primary-color-bg, #e6f9f6)', color: 'var(--animal-primary-color, #19c8b9)', flexShrink: 0 }}>
                      {item.year}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--animal-text-color, #794f27)' }}>{item.term}</span>
                    {item.important && <span style={{ fontSize: 10, color: '#fc736d' }}>★高频</span>}
                  </div>
                  {showAnswers && (
                    <div style={{ fontSize: 13, lineHeight: 1.8, marginTop: 8, padding: '10px 14px',
                      background: 'rgba(25,200,185,.05)', borderRadius: 10, color: 'var(--animal-text-color-secondary, #6b5e4a)' }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ========== QUIZ MODE ========== */}
      {mode === 'quiz' && (
        <>
          {/* Filter toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <Button type={filterMode === 'all' ? 'primary' : 'default'} size="small"
              onClick={() => { setFilterMode('all'); resetQuiz(); }}>
              全部 ({selectedYear === 'all' ? examItems.length : (yearMap.get(selectedYear) || []).length})
            </Button>
            <Button type={filterMode === 'weak' ? 'primary' : 'default'} size="small"
              onClick={() => { setFilterMode('weak'); resetQuiz(); }}>
              🎯 弱项 ({weakPool.length})
            </Button>
          </div>

          {/* Active card */}
          {currentCard && !isFinished && (
            <>
              <div style={{ marginBottom: 8, textAlign: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6,
                  background: 'var(--animal-primary-color-bg, #e6f9f6)', color: 'var(--animal-primary-color, #19c8b9)' }}>
                  {currentCard.year}年
                </span>
                {currentCard.important && <span style={{ fontSize: 10, color: '#fc736d', marginLeft: 6 }}>★高频</span>}
              </div>
              <FlashCard
                key={currentCard.id}
                question={currentCard.term}
                answer={currentCard.answer}
                index={currentIndex}
                total={quizCards.length}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
              />
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16,
                fontSize: 13, color: 'var(--animal-text-color-secondary, #9f927d)' }}>
                <span>✅ {correctCount}</span>
                <span>❌ {wrongCount}</span>
                <span>📊 {correctCount + wrongCount > 0 ? Math.round(correctCount / (correctCount + wrongCount) * 100) : 0}%</span>
                <span>📦 弱项池 {weakPool.length}</span>
              </div>
            </>
          )}

          {/* Empty weak pool */}
          {filterMode === 'weak' && quizCards.length === 0 && (
            <Card>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 40 }}>🎉</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>名词解释弱项池已清空！</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <Button type="primary" onClick={() => setFilterMode('all')}>回到全部</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Finished */}
          {isFinished && quizCards.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Card color="app-green">
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>本轮完成</div>
                <div style={{ fontSize: 13, marginTop: 4, opacity: 0.8 }}>
                  ✅ {correctCount}  ❌ {wrongCount}
                  {filterMode === 'weak' && weakPool.length === 0 ? ' — 弱项全部清除！' : ''}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button type="primary" onClick={resetQuiz}>🔄 再来一轮</Button>
                  {filterMode === 'all' && weakPool.length > 0 && (
                    <Button type="default" onClick={() => { setFilterMode('weak'); resetQuiz(); }}>
                      🎯 专项攻克弱项 ({weakPool.length})
                    </Button>
                  )}
                  <Button type="default" onClick={() => navigate('/')}>🏠 返回首页</Button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Tips */}
      <Card color="app-teal" style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, lineHeight: 1.8, color: '#fff' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>💡 第二轮复习建议</div>
          ① {mode === 'list' ? '选择一个年份 → 遮住答案 → 在纸上写出 → 对照' : '逐题挑战 → 看术语 → 脑中回忆 → 翻卡对照 → 标记弱项'}<br/>
          ② 漏掉的关键词用红笔补上<br/>
          ③ 重复 3-5 遍，直到能完整输出<br/>
          ④ 用"逐题挑战"模式攻克弱项池
        </div>
      </Card>
    </AppShell>
  );
}
