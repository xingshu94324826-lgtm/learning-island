import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from 'animal-island-ui';
import AppShell from '../components/AppShell';
import knowledgeData from '../data/knowledge.json';
import type { KnowledgeBase } from '../types';

const data = knowledgeData as KnowledgeBase;

export default function GraphPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const subject = data.subjects.find(s => s.id === subjectId) || data.subjects[0];

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
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {data.subjects.map(s => (
          <Button
            key={s.id}
            type={s.id === subject.id ? 'primary' : 'default'}
            size="small"
            onClick={() => navigate(`/graph/${s.id}`)}
          >
            {s.icon} {s.name}
          </Button>
        ))}
      </div>

      <div style={{
        fontSize: 14, fontWeight: 700,
        color: 'var(--animal-text-color, #794f27)',
        marginBottom: 4,
      }}>
        🧠 {subject.name} · 知识结构
      </div>
      <div style={{
        fontSize: 12, color: 'var(--animal-text-color-secondary, #9f927d)',
        marginBottom: 16,
      }}>
        点击章节展开知识点，再点击进入详情
      </div>

      {/* Root */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{
          background: 'var(--animal-primary-color, #19c8b9)',
          color: '#fff', padding: '12px 28px',
          borderRadius: 24, fontWeight: 700, fontSize: 14,
          boxShadow: '0 3px 0 rgba(0,0,0,.08)',
        }}>
          {subject.icon} {subject.name}
        </div>
      </div>

      {/* Chapters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {subject.chapters.map(ch => {
          const isOpen = expanded.has(ch.id);
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
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{ch.title}</div>
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
                  {ch.knowledgePoints.map(kp => (
                    <Card
                      key={kp.id}
                      color="default"
                      style={{ marginTop: 4, padding: '8px 12px', cursor: 'pointer' }}
                      onClick={() => navigate(`/subject/${subject.id}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>{kp.title}</span>
                        <span style={{ color: '#f5c31c', fontSize: 10 }}>
                          {'★'.repeat(kp.importance)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
