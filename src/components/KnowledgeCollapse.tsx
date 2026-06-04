import React from 'react';
import { Collapse } from 'animal-island-ui';
import type { KnowledgePoint } from '../types';

interface KnowledgeCollapseProps {
  kp: KnowledgePoint;
  defaultExpanded?: boolean;
}

export default function KnowledgeCollapse({ kp, defaultExpanded = false }: KnowledgeCollapseProps) {
  return (
    <Collapse
      question={
        <span>
          {kp.title}
          {kp.importance >= 3 && (
            <span style={{
              display: 'inline-flex', gap: 2, fontSize: 12,
              color: '#f5c31c', marginLeft: 8,
              animation: 'heartbeat 2s ease-in-out infinite',
            }}>
              {'★'.repeat(kp.importance)}
            </span>
          )}
        </span>
      }
      answer={
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {kp.content}
        </div>
      }
      defaultExpanded={defaultExpanded}
    />
  );
}
