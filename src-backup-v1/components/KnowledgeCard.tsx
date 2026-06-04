import React from 'react';
import { Card } from 'animal-island-ui';
import type { KnowledgePoint } from '../types';

interface KnowledgeCardProps {
  kp: KnowledgePoint;
}

const COLOR_MAP: Record<string, React.ComponentProps<typeof Card>['color']> = {
  red: 'app-red',
  blue: 'app-blue',
  green: 'app-green',
  yellow: 'app-yellow',
};

export default function KnowledgeCard({ kp }: KnowledgeCardProps) {
  const color = COLOR_MAP[kp.color] || 'default';

  return (
    <Card color={color} style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{kp.title}</div>
        <span style={{
          display: 'inline-flex', gap: 2, fontSize: 12,
          color: color === 'app-yellow' ? '#f5c31c' : 'rgba(255,255,255,.8)',
        }}>
          {'★'.repeat(kp.importance)}{'☆'.repeat(5 - kp.importance)}
        </span>
      </div>
      <div style={{
        marginTop: 8, fontSize: 13, opacity: 0.95,
        lineHeight: 1.7, whiteSpace: 'pre-wrap',
      }}>
        {kp.content}
      </div>
      {kp.tags.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {kp.tags.map(tag => (
            <span key={tag} style={{
              background: 'rgba(255,255,255,.25)',
              padding: '2px 10px', borderRadius: 12, fontSize: 10,
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
