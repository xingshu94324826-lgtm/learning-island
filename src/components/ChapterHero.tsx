import React from 'react';
import { Card } from 'animal-island-ui';

interface ChapterHeroProps {
  title: string;
  chapterNumber: number;
  importance: number;
  tags: string[];
  sourceRef?: string;
}

const STAR: React.CSSProperties = {
  display: 'inline-flex', gap: 2,
  fontSize: 12, color: '#f5c31c',
  letterSpacing: 1,
  animation: 'heartbeat 2s ease-in-out infinite',
};

export default function ChapterHero({ title, chapterNumber, importance, tags, sourceRef }: ChapterHeroProps) {
  return (
    <Card color="app-teal" style={{ marginBottom: 16 }}>
      <div style={{
        background: 'linear-gradient(135deg, #82d5bb 0%, #19c8b9 100%)',
        color: '#fff',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 18,
      }}>
        <div style={{
          position: 'absolute', right: -10, top: -10,
          fontSize: 64, opacity: 0.2,
          animation: 'float 5s ease-in-out infinite',
        }}>
          🍃
        </div>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, opacity: 0.8 }}>
          📖 第{chapterNumber}章
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{title}</div>
        {sourceRef && (
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
            📖 原文出处：{sourceRef}
          </div>
        )}
        {tags.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span key={tag} style={{
                background: 'rgba(255,255,255,.25)',
                padding: '3px 10px', borderRadius: 10, fontSize: 10,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <span style={STAR}>{'★'.repeat(importance)}{'☆'.repeat(5 - importance)}</span>
          <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>
            {importance >= 5 ? '核心章节' : importance >= 3 ? '重要章节' : '基础章节'}
          </span>
        </div>
      </div>
    </Card>
  );
}
