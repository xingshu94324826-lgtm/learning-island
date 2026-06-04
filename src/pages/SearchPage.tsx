import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from 'animal-island-ui';
import Fuse from 'fuse.js';
import AppShell from '../components/AppShell';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

const fuse = new Fuse(data.searchIndex, {
  keys: ['title', 'content', 'tags'],
  threshold: 0.4,
  includeScore: true,
});

function highlight(text: string, term: string): React.ReactNode {
  if (!term.trim()) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase()
      ? <mark key={i} style={{ background: '#fef3c7', color: '#92400e', padding: '0 2px', borderRadius: 2 }}>{part}</mark>
      : part
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim()).slice(0, 20);
  }, [query]);

  const weakPointChapters = useMemo(() => {
    return data.subjects.flatMap(sub =>
      sub.chapters.filter(ch => ch.weakPoints.length > 0).map(ch => ({
        subjectId: sub.id, subjectName: sub.name, subjectIcon: sub.icon,
        chapterId: ch.id, chapterTitle: ch.title, chapterOrder: ch.order,
        count: ch.weakPoints.length,
      }))
    ).sort((a, b) => b.count - a.count);
  }, []);

  return (
    <AppShell>
      <Input size="large" placeholder="搜索考点... 如「系统论」「建构主义」「AECT」"
        value={query} onChange={e => setQuery(e.target.value)} allowClear onClear={() => setQuery('')} />

      {query.trim() && (
        <div style={{ margin: '16px 0 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--animal-text-color, #794f27)', marginBottom: 10 }}>
            🔍 找到 {results.length} 条结果
          </div>
          {results.length === 0 ? (
            <Card><div style={{ textAlign: 'center', padding: 24, color: 'var(--animal-text-color-secondary, #9f927d)', fontSize: 13 }}>
              没有找到「{query}」相关的内容，换个关键词试试？
            </div></Card>
          ) : (
            results.map(({ item }) => (
              <Card key={item.id} color="default" style={{ marginBottom: 8, cursor: 'pointer' }}
                onClick={() => navigate(`/subject/${item.subjectId}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                    background: 'var(--animal-primary-color-bg, #e6f9f6)', color: 'var(--animal-primary-color, #19c8b9)', flexShrink: 0 }}>
                    {item.type === 'knowledge-point' ? '考点' : item.type === 'weak-point' ? '薄弱' : item.type === 'flashcard' ? '闪卡' : '章节'}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{highlight(item.title, query)}</span>
                </div>
                {item.content && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--animal-text-color-secondary, #9f927d)',
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {highlight(item.content.substring(0, 150), query)}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--animal-text-color, #794f27)', marginBottom: 10 }}>
          🎯 薄弱点复习优先级
        </div>
        {weakPointChapters.length === 0 ? (
          <Card><div style={{ textAlign: 'center', padding: 24, fontSize: 13, color: 'var(--animal-text-color-secondary, #9f927d)' }}>🎉 暂无薄弱点！</div></Card>
        ) : (
          weakPointChapters.map(ch => (
            <Card key={ch.chapterId} color="default" style={{ marginBottom: 8, cursor: 'pointer' }}
              onClick={() => navigate(`/subject/${ch.subjectId}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{ch.subjectIcon} {ch.subjectName} · 第{ch.chapterOrder}章 {ch.chapterTitle}</div>
                  <div style={{ fontSize: 11, color: '#fc736d', marginTop: 2 }}>{ch.count} 个薄弱点待攻克</div>
                </div>
                <Button type="primary" size="small">复习 →</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
