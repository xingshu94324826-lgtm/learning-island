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
  const { getOverallProgress, getWeakPoints } = useProgress();

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
              已标记 {Object.keys(useProgress().progress).length} / {totalKPs} 个考点
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

      {/* 其余原有内容保持不变... */}
      {/* Subject cards ... Quick actions ... */}
    </AppShell>
  );
}