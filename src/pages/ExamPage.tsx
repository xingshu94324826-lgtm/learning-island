import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Collapse } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import { examItems, groupByYear } from '../data/examData';

export default function ExamPage() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [showAnswers, setShowAnswers] = useState(false);

  const yearMap = useMemo(() => groupByYear(examItems), []);
  const years = useMemo(() => [...yearMap.keys()].sort((a, b) => b - a), [yearMap]);

  const displayedItems = useMemo(() => {
    if (selectedYear === 'all') return examItems;
    return yearMap.get(selectedYear) || [];
  }, [selectedYear, yearMap]);

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Button type="text" onClick={() => navigate('/')}>← 返回</Button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--animal-text-color, #794f27)' }}>
          📝 真题练习 · 名词解释
        </h2>
      </div>

      {/* Year selector */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <Button
          key="all"
          type={selectedYear === 'all' ? 'primary' : 'default'}
          size="small"
          onClick={() => setSelectedYear('all')}
        >
          全部 ({examItems.length})
        </Button>
        {years.map(y => (
          <Button
            key={y}
            type={selectedYear === y ? 'primary' : 'default'}
            size="small"
            onClick={() => setSelectedYear(y)}
          >
            {y}年 ({yearMap.get(y)?.length || 0})
          </Button>
        ))}
      </div>

      {/* Toggle answers */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type={showAnswers ? 'default' : 'primary'}
          size="small"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? '🙈 隐藏全部答案' : '👁 显示全部答案'}
        </Button>
        <span style={{ fontSize: 11, color: 'var(--animal-text-color-secondary, #9f927d)', marginLeft: 8 }}>
          建议：先遮住答案，自己写一遍，再对照
        </span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {displayedItems.map((item, idx) => (
          <Card key={`${item.year}-${item.term}-${idx}`} color="default">
            <div style={{ padding: '4px 0' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6,
                  background: 'var(--animal-primary-color-bg, #e6f9f6)',
                  color: 'var(--animal-primary-color, #19c8b9)',
                  flexShrink: 0,
                }}>
                  {item.year}
                </span>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--animal-text-color, #794f27)' }}>
                  {item.term}
                </span>
                {item.important && (
                  <span style={{ fontSize: 10, color: '#fc736d' }}>★高频</span>
                )}
              </div>
              {showAnswers && (
                <div style={{
                  fontSize: 13, lineHeight: 1.8, marginTop: 8,
                  padding: '10px 14px', background: 'rgba(25,200,185,.05)',
                  borderRadius: 10, color: 'var(--animal-text-color-secondary, #6b5e4a)',
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {displayedItems.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--animal-text-color-secondary, #9f927d)' }}>
            该年份暂无真题数据
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card color="app-teal" style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, lineHeight: 1.8, color: '#fff' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>💡 第二轮复习建议</div>
          ① 选择一个年份 → 遮住答案<br/>
          ② 在纸上写出你能想到的所有内容<br/>
          ③ 打开答案对照 → 漏掉的关键词用红笔补上<br/>
          ④ 重复 3-5 遍，直到能完整输出<br/>
          ⑤ 标记始终记不住的，加入薄弱点
        </div>
      </Card>
    </AppShell>
  );
}
