import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Divider } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import NpcBubble from '../components/NpcBubble';
import ChapterHero from '../components/ChapterHero';
import FrameworkTree from '../components/FrameworkTree';
import KnowledgeCard from '../components/KnowledgeCard';
import KnowledgeCollapse from '../components/KnowledgeCollapse';
import CheckItem from '../components/CheckItem';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  const subject = data.subjects.find(s => s.id === subjectId);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [checkedWeakPoints, setCheckedWeakPoints] = useState<Set<string>>(new Set());

  // ── 404 guard ──
  if (!subject || subject.chapters.length === 0) {
    return (
      <AppShell>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48 }}>🤔</div>
          <div style={{ fontSize: 16, fontWeight: 700, margin: '12px 0', color: 'var(--animal-text-color, #794f27)' }}>
            科目未找到
          </div>
          <Button type="primary" onClick={() => navigate('/')}>← 返回首页</Button>
        </div>
      </AppShell>
    );
  }

  const chapter = subject.chapters[chapterIndex];

  const toggleWeakPoint = (text: string) => {
    setCheckedWeakPoints(prev => {
      const next = new Set(prev);
      next.has(text) ? next.delete(text) : next.add(text);
      return next;
    });
  };

  return (
    <AppShell>
      {/* ── NPC 引导 ── */}
      <NpcBubble>
        你正在学习 <strong>{subject.name}</strong>，当前是第 {chapter.order} 章「{chapter.title}」。
        本章共 <strong>{chapter.knowledgePoints.length} 个考点</strong>，
        {chapter.weakPoints.length} 个薄弱点待攻克。加油！🍃
      </NpcBubble>

      {/* ── 章节切换器 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 16, flexWrap: 'wrap',
      }}>
        <Button type="default" size="small" disabled={chapterIndex === 0}
          onClick={() => setChapterIndex(i => i - 1)}>
          ←
        </Button>
        <div style={{ display: 'flex', gap: 4, flex: 1, overflowX: 'auto', justifyContent: 'center' }}>
          {subject.chapters.map((ch, i) => (
            <Button
              key={ch.id}
              type={i === chapterIndex ? 'primary' : 'default'}
              size="small"
              onClick={() => setChapterIndex(i)}
            >
              第{ch.order}章
            </Button>
          ))}
        </div>
        <Button type="default" size="small" disabled={chapterIndex === subject.chapters.length - 1}
          onClick={() => setChapterIndex(i => i + 1)}>
          →
        </Button>
      </div>

      {/* ── 章节 Hero ── */}
      <ChapterHero
        title={chapter.title}
        chapterNumber={chapter.order}
        importance={chapter.importance}
        tags={chapter.knowledgePoints.slice(0, 4).map(k => k.title.replace(/[★☆\s]/g, '').substring(0, 8))}
      />

      {/* ── 知识框架树 ── */}
      {chapter.frameworkTree && <FrameworkTree tree={chapter.frameworkTree} />}

      {/* ── 知识点卡片 ── */}
      <div style={{
        fontSize: 15, fontWeight: 700,
        color: 'var(--animal-text-color, #794f27)',
        marginBottom: 10, marginTop: 20,
      }}>
        📋 核心考点
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
        gap: 12,
      }}>
        {chapter.knowledgePoints.map(kp => (
          <KnowledgeCard key={kp.id} kp={kp} />
        ))}
      </div>

      {/* ── 理论知识点（折叠） ── */}
      {chapter.knowledgePoints.filter(kp => kp.category === 'theory').length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontSize: 15, fontWeight: 700,
            color: 'var(--animal-text-color, #794f27)',
            marginBottom: 10,
          }}>
            🧠 理论基础（点击展开）
          </div>
          {chapter.knowledgePoints
            .filter(kp => kp.category === 'theory')
            .map(kp => (
              <KnowledgeCollapse key={kp.id} kp={kp} defaultExpanded={kp.importance >= 4} />
            ))
          }
        </div>
      )}

      <div style={{ margin: '20px 0' }}>
        <Divider type="wave-yellow" />
      </div>

      {/* ── 薄弱点清单 ── */}
      {chapter.weakPoints.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 15, fontWeight: 700,
            color: 'var(--animal-text-color, #794f27)',
            marginBottom: 10,
          }}>
            ⚠️ 薄弱点
            <span style={{ fontSize: 11, color: '#fc736d', fontWeight: 400, marginLeft: 8 }}>
              {chapter.weakPoints.filter(wp => !checkedWeakPoints.has(wp)).length} 个待攻克
            </span>
          </div>
          {chapter.weakPoints.map(wp => (
            <CheckItem
              key={wp}
              text={wp}
              checked={checkedWeakPoints.has(wp)}
              onToggle={() => toggleWeakPoint(wp)}
            />
          ))}
        </div>
      )}

      {/* ── 易错点 ── */}
      {chapter.errorProne.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 15, fontWeight: 700,
            color: 'var(--animal-text-color, #794f27)',
            marginBottom: 10,
          }}>
            ❗ 常见易错点
          </div>
          <Card>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 2.2 }}>
              {chapter.errorProne.map((ep, i) => (
                <li key={i}>{ep}</li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      {/* ── 底部操作 ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Button type="default" disabled={chapterIndex === 0}
          onClick={() => setChapterIndex(i => i - 1)} style={{ flex: 1 }}>
          ← 上一章
        </Button>
        <Button type="primary" size="large" style={{ flex: 2 }}
          onClick={() => navigate(`/flashcards/${subjectId}`)}>
          ⚡ 刷闪卡
        </Button>
        <Button type="default" disabled={chapterIndex >= subject.chapters.length - 1}
          onClick={() => setChapterIndex(i => i + 1)} style={{ flex: 1 }}>
          下一章 →
        </Button>
      </div>
    </AppShell>
  );
}
