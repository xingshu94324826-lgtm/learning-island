// src/pages/HomePage.tsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import NpcBubble from '../components/NpcBubble';
import { useMastery } from '../hooks/useMastery';
import { useProgress } from '../contexts/ProgressContext';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

// 729 考研：2026年12月19-20日（统考通常是12月倒数第二个周末）
const EXAM_DATE = new Date('2026-12-19');

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mastery = useMastery();
  const { getOverallProgress, getAverageMastery, getCoverage, getDueReviews, progress } = useProgress();

  const progressScore = getOverallProgress();
  const avgMastery = getAverageMastery();
  const totalKPs = useMemo(() =>
    data.subjects.reduce((s, sub) =>
      s + sub.chapters.reduce((cs, ch) => cs + ch.knowledgePoints.length, 0), 0),
  []);
  const coverage = getCoverage(totalKPs);
  const dueReviews = getDueReviews();
  const daysLeft = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((EXAM_DATE.getTime() - today.getTime()) / 86400000));
  }, []);

  const totalChapters = data.subjects.reduce((s, sub) => s + sub.chapters.length, 0);

  const gradeLabel = progressScore >= 80 ? '优秀' :
    progressScore >= 60 ? '良好' : progressScore >= 40 ? '一般' : '待加强';
  const gradeColor = progressScore >= 80 ? '#6fba2c' :
    progressScore >= 60 ? '#19c8b9' : progressScore >= 40 ? '#f5c31c' : '#fc736d';

  const isHomePage = location.pathname === '/';

  return (
    <AppShell>
      {/* ── 考研倒计时 ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', marginBottom: 8,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 600, padding: '4px 16px', borderRadius: 12,
          background: daysLeft <= 30 ? '#fff0f0' : 'var(--animal-primary-color-bg, #e6f9f6)',
          color: daysLeft <= 30 ? '#fc736d' : 'var(--animal-text-color-secondary, #9f927d)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          📅 距离 729 考研还有 <strong style={{ fontSize: 14 }}>{daysLeft}</strong> 天
        </div>
      </div>

      {/* 三轮学习切换 */}
      {isHomePage && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
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

      {/* ── 今日待复习 ── */}
      {dueReviews > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)',
          border: '2px solid #f5c31c', borderRadius: 16, padding: '14px 20px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#b45309' }}>
            🔥 今日待复习 {dueReviews} 个考点
          </span>
          <span style={{ fontSize: 12, color: 'var(--animal-text-color-secondary, #9f927d)' }}>
            预计耗时 {Math.round(dueReviews * 1.5)} 分钟
          </span>
        </div>
      )}

      {/* ── Dashboard ── */}
      <div style={{
        background: '#fff', borderRadius: 24, padding: '24px', border: '2px solid var(--animal-border-color-light, #e8e2d6)', marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Mastery ring */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: `conic-gradient(${gradeColor} ${progressScore}%, #e8e2d6 ${progressScore}%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: gradeColor }}>
              {progressScore}<span style={{ fontSize: 14 }}>%</span>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>总掌握度 · {gradeLabel}</div>
            <div style={{ fontSize: 13, color: 'var(--animal-text-color-secondary)', marginTop: 2 }}>
              覆盖率 {coverage}%（{Object.values(progress).filter(p => p.mastery > 0).length}/{totalKPs}）
              <span style={{ marginLeft: 8 }}>|</span>
              <span style={{ marginLeft: 8 }}>平均 {avgMastery}
                <span style={{ fontSize: 10 }}>/5 星</span>
              </span>
            </div>
          </div>
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
        <Button type="primary" size="large" onClick={() => navigate('/flashcards/all')}>
          ⚡ 刷闪卡 ({data.flashcards.length}张)
        </Button>
        <Button type="primary" size="large" onClick={() => navigate(`/graph/${data.subjects[0]?.id || 'edutech'}`)}>
          🧠 知识图谱
        </Button>
                {mastery.totalWeakRemaining > 0 && mastery.weakestChapter && (
          <Button type="primary" size="large"
            onClick={() => navigate(`/subject/${mastery.weakestChapter.subjectId}`)}>
            🎯 最弱章节
          </Button>
        )}
        <Button type="dashed" size="large" onClick={() => {
          const lines: string[] = [];
          lines.push('# 729 教育技术学 · 个人知识档案\n');
          lines.push(`> 导出时间：${new Date().toLocaleString()}\n`);
          lines.push(`> 总掌握度：${progressScore}% | 覆盖率：${coverage}% | 平均：${avgMastery}/5\n`);
          lines.push(`> 已标记：${Object.values(progress).filter(p => p.mastery > 0).length}/${totalKPs} 个考点\n`);
          lines.push(`> 距离考试：${daysLeft} 天\n`);
          lines.push('---\n');
          lines.push('## 掌握度统计\n');
          lines.push('| 等级 | 考点数 |');
          lines.push('|------|--------|');
          for (let lv = 1; lv <= 5; lv++) {
            const count = Object.values(progress).filter(p => p.mastery === lv).length;
            lines.push(`| ${'⭐'.repeat(lv)} | ${count} |`);
          }
          const today = new Date().toISOString().slice(0, 10);
          const dueCount = Object.values(progress).filter(p => p.mastery >= 1 && p.nextReview && p.nextReview <= today).length;
          if (dueCount > 0) lines.push(`\n🔥 今日待复习：${dueCount} 个考点\n`);
          lines.push('\n---\n');
          for (const sub of data.subjects) {
            lines.push(`## ${sub.icon} ${sub.name}\n`);
            for (const ch of sub.chapters) {
              lines.push(`### 第${ch.order}章 ${ch.title}\n`);
              if (ch.frameworkTree) {
                lines.push('```');
                lines.push(ch.frameworkTree);
                lines.push('```\n');
              }
              for (const kp of ch.knowledgePoints) {
                const pr = progress[kp.id];
                const star = pr?.mastery ? '⭐'.repeat(pr.mastery) : '⬜';
                lines.push(`- ${star} **${kp.title.replace(/\*/g, '')}**`);
                if (pr?.notes?.length) {
                  for (const note of pr.notes) {
                    lines.push(`  > 📝 ${note.content} (${note.updatedAt.slice(0,10)})`);
                  }
                }
              }
              lines.push('');
            }
          }
          lines.push('---\n');
          lines.push('## 薄弱点清单\n');
          for (const sub of data.subjects) {
            const checked: string[] = JSON.parse(localStorage.getItem(`weak-pts-${sub.id}`) || '[]');
            for (const ch of sub.chapters) {
              const unresolved = ch.weakPoints.filter(wp => !checked.includes(wp));
              if (unresolved.length > 0) {
                lines.push(`### ${sub.name} · 第${ch.order}章 ${ch.title}`);
                for (const wp of unresolved) lines.push(`- [ ] ${wp}`);
                lines.push('');
              }
            }
          }
          const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `729-知识档案-${new Date().toISOString().slice(0,10)}.md`;
          a.click();
          URL.revokeObjectURL(a.href);
        }}>
          📥 导出档案
        </Button>
        <Button type="text" size="small" onClick={() => navigate('/changelog')}>
          📋 更新日志
        </Button>
      </div>
    </AppShell>
  );
}
