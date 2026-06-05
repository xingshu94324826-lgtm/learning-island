import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Divider } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import NpcBubble from '../components/NpcBubble';
import ChapterHero from '../components/ChapterHero';
import FrameworkTree from '../components/FrameworkTree';
import KnowledgeCard from '../components/KnowledgeCard';
import CheckItem from '../components/CheckItem';
import Celebration from '../components/Celebration';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMastery } from '../hooks/useMastery';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  const subject = data.subjects.find(s => s.id === subjectId);
  const [chapterIndex, setChapterIndex] = useLocalStorage(`chapter-idx-${subjectId || 'home'}`, 0);
  const [checkedWeakPoints, setCheckedWeakPoints] = useLocalStorage<string[]>(`weak-pts-${subjectId || 'home'}`, []);
  const [, setLastSubject] = useLocalStorage<string>('last-subject', '');
  // Track last visited
  React.useEffect(() => { if (subjectId) setLastSubject(subjectId); }, [subjectId, setLastSubject]);

  const checkedSet = new Set(checkedWeakPoints);

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
  const { subjects: masterySubjects } = useMastery();
  const chapterMastery = masterySubjects.find(s => s.subjectId === subjectId)
    ?.chapters.find(c => c.chapterId === chapter.id);
  const masteryScore = chapterMastery?.score ?? 0;

  const resolvedCount = chapter.weakPoints.filter(wp => checkedSet.has(wp)).length;
  const totalWeak = chapter.weakPoints.length;
  const allResolved = totalWeak > 0 && resolvedCount === totalWeak;
  const [celebrated, setCelebrated] = useLocalStorage(`celebrated-${chapter.id}`, false);
  const showCelebration = allResolved && !celebrated;

  // Dynamic NPC message
  const npcMessage = useMemo(() => {
    if (allResolved) return '🎉 太厉害了！你把本章所有薄弱点都攻克了！下一章在等你~';
    if (resolvedCount > 0) return `继续加油！你已经攻克了 ${resolvedCount}/${totalWeak} 个薄弱点。`;
    return `刚开始学习「${chapter.title}」，共 ${chapter.knowledgePoints.length} 个考点，${totalWeak} 个薄弱点等你来挑战！🍃`;
  }, [allResolved, resolvedCount, totalWeak, chapter.title, chapter.knowledgePoints.length]);

  const toggleWeakPoint = (text: string) => {
    setCheckedWeakPoints(prev => {
      if (prev.includes(text)) return prev.filter(t => t !== text);
      return [...prev, text];
    });
  };

  return (
    <AppShell>
      {/* ── NPC 引导（动态） ── */}
      <NpcBubble>
        📖 <strong>{subject.name}</strong> · 第{chapter.order}章「{chapter.title}」<br/>
        {npcMessage}
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
        sourceRef={chapter.sourceRef}
      />

      {/* ── 章节掌握度 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, background: '#fff', borderRadius: 18,
        padding: '12px 18px', border: '2px solid var(--animal-border-color-light, #e8e2d6)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `conic-gradient(
            ${masteryScore >= 80 ? '#6fba2c' : masteryScore >= 50 ? '#19c8b9' : masteryScore >= 30 ? '#f5c31c' : '#fc736d'} ${masteryScore}%,
            var(--animal-border-color-light, #e8e2d6) ${masteryScore}%
          )`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: 'var(--animal-text-color, #794f27)',
          }}>
            {masteryScore}
          </div>
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700 }}>章节掌握度</div>
          <div style={{ color: 'var(--animal-text-color-secondary, #9f927d)' }}>
            薄弱点 {chapterMastery?.weakResolved ?? 0}/{chapterMastery?.weakTotal ?? 0}
            {chapterMastery && chapterMastery.fcTotal > 0 &&
              ` · 闪卡 ${chapterMastery.fcTotal - chapterMastery.fcWeak}/${chapterMastery.fcTotal}`}
          </div>
        </div>
      </div>

      {/* ── 知识框架树 ── */}
      {chapter.frameworkTree && (
        <FrameworkTree
          tree={chapter.frameworkTree}
          knowledgePoints={chapter.knowledgePoints}
          onNodeClick={(kpId) => {
            const el = document.querySelector(`[data-kp-id="${kpId}"]`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('kp-highlight');
              setTimeout(() => el.classList.remove('kp-highlight'), 1500);
            }
          }}
        />
      )}

      {/* ── 知识点卡片 —— 全部可折叠 ── */}
      <div style={{
        fontSize: 15, fontWeight: 700,
        color: 'var(--animal-text-color, #794f27)',
        marginBottom: 10, marginTop: 20,
      }}>
        📋 核心考点（点击展开）
      </div>
      {chapter.knowledgePoints.map(kp => (
        <div key={kp.id} data-kp-id={kp.id}>
          <KnowledgeCard
            kp={kp}
            defaultExpanded={kp.importance >= 4}
          />
        </div>
      ))}

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
              {chapter.weakPoints.filter(wp => !checkedSet.has(wp)).length} 个待攻克
            </span>
          </div>
          {chapter.weakPoints.map(wp => (
            <CheckItem
              key={wp}
              text={wp}
              checked={checkedSet.has(wp)}
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
      {chapter.weakPoints.length > 0 && (
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <Button type="text" size="small"
            onClick={() => navigate(`/flashcards/${subjectId}?mode=chapterWeak`)}>
            🎯 薄弱章节闪卡（包含本章）
          </Button>
        </div>
      )}

      {/* Celebration when all weak points resolved */}
      <Celebration
        show={showCelebration}
        message="章节完成！"
        onClose={() => setCelebrated(true)}
      />
    </AppShell>
  );
}
