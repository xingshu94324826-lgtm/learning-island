import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import NpcBubble from '../components/NpcBubble';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

export default function HomePage() {
  const navigate = useNavigate();

  const totalChapters = data.subjects.reduce((s, sub) => s + sub.chapters.length, 0);
  const totalKPs = data.subjects.reduce((s, sub) =>
    s + sub.chapters.reduce((cs, ch) => cs + ch.knowledgePoints.length, 0), 0);
  const weakPointCount = data.subjects.reduce(
    (sum, s) => sum + s.chapters.reduce((cs, ch) => cs + ch.weakPoints.length, 0), 0
  );

  return (
    <AppShell>
      <NpcBubble>
        欢迎来到学习之岛！这里共有 <strong>{data.subjects.length} 个科目</strong>、
        <strong>{totalChapters} 章</strong>、
        <strong>{totalKPs} 个考点</strong>。
        还有 <strong>{weakPointCount} 个薄弱点</strong> 等待攻克。
        选择一个科目开始探索吧～ 🍃
      </NpcBubble>

      {/* Subject cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {data.subjects.map(subject => (
          <Card
            key={subject.id}
            color="default"
            onClick={() => navigate(`/subject/${subject.id}`)}
            style={{ cursor: 'pointer', textAlign: 'center', padding: '28px 20px' }}
          >
            <div style={{ fontSize: 44 }}>{subject.icon}</div>
            <div style={{
              fontSize: 15, fontWeight: 800, marginTop: 10,
              color: 'var(--animal-text-color, #794f27)',
            }}>
              {subject.name}
            </div>
            <div style={{
              fontSize: 12, color: 'var(--animal-text-color-secondary, #9f927d)',
              marginTop: 6, lineHeight: 1.6,
            }}>
              {subject.chapters.length} 章 · {subject.chapters.reduce((s, ch) => s + ch.knowledgePoints.length, 0)} 个考点
            </div>
            <div style={{ marginTop: 12 }}>
              <Button type="primary" size="small">进入学习 →</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button type="primary" size="large" onClick={() => navigate('/search')}>
          🔍 搜索考点
        </Button>
        <Button type="default" size="large" onClick={() => navigate(`/flashcards/${data.subjects[0]?.id || 'edutech'}`)}>
          ⚡ 刷闪卡 ({data.flashcards.length}张)
        </Button>
        <Button type="dashed" size="large" onClick={() => navigate(`/graph/${data.subjects[0]?.id || 'edutech'}`)}>
          🧠 知识图谱
        </Button>
      </div>
    </AppShell>
  );
}
