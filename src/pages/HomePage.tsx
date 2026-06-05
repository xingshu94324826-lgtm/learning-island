// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import NpcBubble from '../components/NpcBubble';
import { useMastery } from '../hooks/useMastery';
import { useProgress } from '../contexts/ProgressContext';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mastery = useMastery();
  const { getOverallProgress, getWeakPoints, progress } = useProgress();

  const progressScore = getOverallProgress();
  const weakPoints = getWeakPoints(5);

  const totalChapters = data.subjects.reduce((s, sub) => s + sub.chapters.length, 0);
  const totalKPs = data.subjects.reduce((s, sub) =>
    s + sub.chapters.reduce((cs, ch) => cs + ch.knowledgePoints.length, 0), 0);

  const gradeLabel = progressScore >= 80 ? '优秀' :
    progressScore >= 60 ? '良好' : progressScore >= 40 ? '一般' : '待加强';
  const gradeColor = progressScore >= 80 ? '#6fba2c' :
    progressScore >= 60 ? '#19c8b9' : progressScore >= 40 ? '#f5c31c' : '#fc736d';

  const isHomePage = location.pathname === '/';

  return (
    <AppShell>
      {/* 三轮学习切换 */}
      {isHomePage && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--animal-border-color-light, #e8e2d6)', borderRadius: 14, padding: 3, gap: 2 }}>
            <button onClick={() => navigate('/')} style={{ padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 700, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
              🏗️ 第一轮 · 建骨架
            </button>
            <button onClick={() => navigate('/exam')} style={{ padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600, background: 'transparent' }}>
              📝 第二轮 · 刷真题
            </button>
            <button onClick={() => navigate('/template')} style={{ padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600, background: 'transparent' }}>
              📐 第三轮 · 练输出
            </button>
          </div>
        </div>
      )}

      {/* 新版掌握度仪表盘 */}
      <div style={{
        background: '#fff', borderRadius: 24, padding: '24px', border: '2px solid var(--animal-border-color-light, #e8e2d6)', marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: `conic-gradient(${gradeColor} ${progressScore}%, #e8e2d6 ${progressScore}%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: gradeColor }}>
              {progressScore}<span style={{ fontSize: 14 }}>%</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>总掌握度 · {gradeLabel}</div>
            <div style={{ fontSize: 13, color: 'var(--animal-text-color-secondary)' }}>
              已标记 {Object.keys(progress).length} / {totalKPs} 个考点
            </div>
          </div>

          {weakPoints.length > 0 && (
            <Button type="primary" onClick={() => navigate('/subject/edutech')}>
              🎯 重点复习弱点 ({weakPoints.length})
            </Button>
          )}
        </div>

        {/* 三轮学习进度条 */}
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div>🏗️ 第一轮（框架构建）</div>
            <div style={{ height: 6, background: '#e8e2d6', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ height: '100%', width: `${Math.min(progressScore * 0.7, 100)}%`, background: '#19c8b9' }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div>📝 第二轮（刷真题/闪卡）</div>
            <div style={{ height: 6, background: '#e8e2d6', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ height: '100%', width: `${mastery.overallScore}%`, background: '#f5c31c' }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div>📐 第三轮（练输出）</div>
            <div style={{ height: 6, background: '#e8e2d6', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ height: '100%', width: '35%', background: '#6fba2c' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Subject cards with mastery ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16, marginBottom: 28, marginTop: 20,
      }}>
        {mastery.subjects.map(sub => (
          <Card
            key={sub.subjectId}
            color="default"
            onClick={() => navigate(`/subject/${sub.subjectId}`)}
            style={{ cursor: 'pointer', padding: '22px 18px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 36 }}>{sub.subjectIcon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--animal-text-color, #794f27)' }}>
                  {sub.subjectName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--animal-text-color-secondary, #9f927d)' }}>
                  {sub.chapters.length} 章 · {data.subjects.find(s => s.id === sub.subjectId)?.chapters.reduce((s, ch) => s + ch.knowledgePoints.length, 0) ?? 0} 考点
                </div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    flex: 1, height: 4, background: 'var(--animal-border-color-light, #e8e2d6)',
                    borderRadius: 2, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${sub.score}%`,
                      background: sub.score >= 80 ? '#6fba2c' : sub.score >= 50 ? '#19c8b9' : sub.score >= 30 ? '#f5c31c' : '#fc736d',
                      borderRadius: 2, transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, color: 'var(--animal-text-color, #794f27)' }}>
                    {sub.score}
                  </span>
                </div>
              </div>
            </div>
            {/* Chapter mini-bars */}
            <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
              {sub.chapters.map(ch => (
                <div key={ch.chapterId} style={{
                  flex: 1, height: 3, borderRadius: 1.5,
                  background: ch.score >= 80 ? '#6fba2c' : ch.score >= 50 ? '#19c8b9' : ch.score >= 30 ? '#f5c31c' : ch.score === 0 ? 'var(--animal-border-color-light, #e8e2d6)' : '#fc736d',
                }} title={`第${ch.chapterOrder}章 ${ch.chapterTitle}: ${ch.score}`} />
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button type="primary" size="large" onClick={() => navigate('/search')}>
          🔍 搜索考点
        </Button>
        <Button type="default" size="large" onClick={() => navigate('/flashcards/all')}>
          ⚡ 刷闪卡 ({data.flashcards.length}张)
        </Button>
        <Button type="dashed" size="large" onClick={() => navigate(`/graph/${data.subjects[0]?.id || 'edutech'}`)}>
          🧠 知识图谱
        </Button>
        {mastery.totalWeakRemaining > 0 && mastery.weakestChapter && (
          <Button type="primary" size="large"
            onClick={() => navigate(`/subject/${mastery.weakestChapter.subjectId}`)}>
            🎯 最弱章节
          </Button>
        )}
      </div>
    </AppShell>
  );
}