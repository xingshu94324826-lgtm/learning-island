import React from 'react';
import { Collapse } from 'animal-island-ui';
import MarkdownRenderer from './MarkdownRenderer';
import type { KnowledgePoint } from '../types';

interface KnowledgeCardProps {
  kp: KnowledgePoint;
  defaultExpanded?: boolean;
}

const COLOR_BORDER: Record<string, string> = {
  red: '#fc736d',
  blue: '#889df0',
  green: '#8ac68a',
  yellow: '#f7cd67',
};

export default function KnowledgeCard({ kp, defaultExpanded = false }: KnowledgeCardProps) {
  const borderColor = COLOR_BORDER[kp.color] || '#e8e2d6';

  return (
    <div style={{ marginBottom: 8, borderLeft: `3px solid ${borderColor}`, borderRadius: '0 14px 14px 0' }}>
      <Collapse
        question={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{kp.title}</span>
            {kp.importance >= 3 && (
              <span style={{
                display: 'inline-flex', gap: 1, fontSize: 11,
                color: '#f5c31c',
                animation: 'heartbeat 2s ease-in-out infinite',
              }}>
                {'★'.repeat(kp.importance)}
              </span>
            )}
            <span style={{
              fontSize: 9, fontWeight: 600, padding: '1px 7px', borderRadius: 8,
              background: 'var(--animal-primary-color-bg, #e6f9f6)',
              color: 'var(--animal-primary-color, #19c8b9)',
              marginLeft: 'auto',
              flexShrink: 0,
            }}>
              {kp.category === 'definition' ? '定义' :
               kp.category === 'comparison' ? '对比' :
               kp.category === 'theory' ? '理论' : '方法'}
            </span>
          </span>
        }
        answer={
          <div>
            <MarkdownRenderer content={kp.content} />
            {kp.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: 'var(--animal-text-color-secondary, #9f927d)' }}>🔗</span>
                {kp.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                    background: 'var(--animal-border-color-light, #e8e2d6)',
                    color: 'var(--animal-text-color-secondary, #9f927d)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        }
        defaultExpanded={defaultExpanded}
      />
    </div>
  );
}
