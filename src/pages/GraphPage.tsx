import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase, KnowledgePoint } from '../types';

const data = knowledgeData as KnowledgeBase;

// Build cross-reference index: tag → KP list (with chapter & subject info)
interface CrossRefEntry {
  kpId: string;
  kpTitle: string;
  chapterId: string;
  chapterTitle: string;
  subjectId: string;
  subjectName: string;
}

function buildCrossRefIndex(): Map<string, CrossRefEntry[]> {
  const index = new Map<string, CrossRefEntry[]>();
  for (const sub of data.subjects) {
    for (const ch of sub.chapters) {
      for (const kp of ch.knowledgePoints) {
        for (const tag of kp.tags) {
          if (!index.has(tag)) index.set(tag, []);
          index.get(tag)!.push({
            kpId: kp.id, kpTitle: kp.title,
            chapterId: ch.id, chapterTitle: ch.title,
            subjectId: sub.id, subjectName: sub.name,
          });
        }
      }
    }
  }
  return index;
}

// Build once at module load
const crossRefIndex = buildCrossRefIndex();

export default function GraphPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const subject = data.subjects.find(s => s.id === subjectId) || data.subjects[0];

  // All tags across the current subject
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const ch of subject.chapters) {
      for (const kp of ch.knowledgePoints) {
        for (const t of kp.tags) tags.add(t);
      }
    }
    return [...tags].sort();
  }, [subject]);

  // Entries for the active tag, grouped by how "far" they are from current chapter
  const activeTagRefs = useMemo(() => {
    if (!activeTag) return [];
    const refs = crossRefIndex.get(activeTag) || [];
    return refs;
  }, [activeTag]);

  if (!subject) {
    return (
      <AppShell>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--animal-text-color, #794f27)' }}>暂无数据</div>
          <Button type="primary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </AppShell>
    );
  }

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <AppShell>
      {/* Subject selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {data.subjects.map(s => (
          <Button key={s.id} type={s.id === subject.id ? 'primary' : 'default'} size="small"
            onClick={() => { navigate(`/graph/${s.id}`); setActiveTag(null); }}>
            {s.icon} {s.name}
          </Button>
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--animal-text-color, #794f27)', marginBottom: 4 }}>
        🧠 {subject.name} · 知识结构
      </div>
      <div style={{ fontSize: 12, color: 'var(--animal-text-color-secondary, #9f927d)', marginBottom: 12 }}>
        点击章节展开知识点，点击标签查看跨章关联
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
          {allTags.map(tag => (
            <span key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} style={{
              padding: '3px 10px', borderRadius: 10, fontSize: 10, cursor: 'pointer', fontWeight: 600,
              background: activeTag === tag
                ? 'var(--animal-primary-color, #19c8b9)'
                : 'var(--animal-border-color-light, #e8e2d6)',
              color: activeTag === tag ? '#fff' : 'var(--animal-text-color-secondary, #9f927d)',
              transition: 'all 0.15s ease',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Cross-ref panel */}
      {activeTag && activeTagRefs.length > 0 && (
        <Card color="app-teal" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: '#fff' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              🔗 「{activeTag}」跨章节关联 ({activeTagRefs.length} 个知识点)
            </div>
            {activeTagRefs.map(ref => (
              <div key={ref.kpId} style={{
                fontSize: 11, padding: '4px 8px', marginBottom: 3,
                background: 'rgba(255,255,255,.12)', borderRadius: 6, cursor: 'pointer',
              }} onClick={() => {
                navigate(`/subject/${ref.subjectId}`);
              }}>
                <span style={{ opacity: 0.8 }}>{ref.subjectName} · {ref.chapterTitle}</span>
                <span style={{ marginLeft: 8 }}>{ref.kpTitle}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Root */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{
          background: 'var(--animal-primary-color, #19c8b9)',
          color: '#fff', padding: '12px 28px', borderRadius: 24, fontWeight: 700, fontSize: 14,
          boxShadow: '0 3px 0 rgba(0,0,0,.08)',
        }}>
          {subject.icon} {subject.name}
        </div>
      </div>

      {/* Chapters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {subject.chapters.map(ch => {
          const isOpen = expanded.has(ch.id);
          // Filter KPs by active tag
          const filteredKPs = activeTag
            ? ch.knowledgePoints.filter(kp => kp.tags.includes(activeTag))
            : ch.knowledgePoints;
          const hasActiveTagKP = activeTag && filteredKPs.length > 0;

          return (
            <div key={ch.id}>
              <Card
                color={ch.importance >= 5 ? 'app-red' : ch.importance >= 3 ? 'app-blue' : 'app-teal'}
                style={{ cursor: 'pointer' }}
                onClick={() => toggle(ch.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>第{ch.order}章</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {hasActiveTagKP ? '🔗 ' : ''}{ch.title}
                    </div>
                  </div>
                  <span style={{ fontSize: 12 }}>
                    {isOpen ? '▼' : '▶'} {ch.knowledgePoints.length}
                  </span>
                </div>
              </Card>
              {isOpen && (
                <div style={{
                  marginLeft: 16, marginTop: 4,
                  borderLeft: '2px dashed var(--animal-border-color-light, #e8e2d6)',
                  paddingLeft: 12,
                }}>
                  {filteredKPs.map(kp => (
                    <Card key={kp.id} color="default" style={{ marginTop: 4, padding: '8px 12px', cursor: 'pointer' }}
                      onClick={() => navigate(`/subject/${subject.id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>{kp.title}</span>
                        <span style={{ color: '#f5c31c', fontSize: 10 }}>
                          {'★'.repeat(kp.importance)}
                        </span>
                      </div>
                      {/* Tag badges */}
                      {kp.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 3, marginTop: 5, flexWrap: 'wrap' }}>
                          {kp.tags.map(tag => (
                            <span key={tag} onClick={(e) => { e.stopPropagation(); setActiveTag(tag); }} style={{
                              padding: '1px 6px', borderRadius: 6, fontSize: 9, cursor: 'pointer', fontWeight: 600,
                              background: activeTag === tag
                                ? 'var(--animal-primary-color, #19c8b9)'
                                : 'var(--animal-border-color-light, #e8e2d6)',
                              color: activeTag === tag ? '#fff' : 'var(--animal-text-color-secondary, #9f927d)',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                  {filteredKPs.length === 0 && activeTag && (
                    <div style={{ fontSize: 11, color: 'var(--animal-text-color-secondary, #9f927d)', padding: 8 }}>
                      本章暂无「{activeTag}」相关知识点
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
