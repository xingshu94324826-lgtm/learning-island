import React from 'react';
import { Card } from 'animal-island-ui';

interface FrameworkTreeProps {
  tree: string;
}

export default function FrameworkTree({ tree }: FrameworkTreeProps) {
  if (!tree) return null;

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 14, fontWeight: 700,
        color: 'var(--animal-text-color, #794f27)',
        marginBottom: 10,
      }}>
        🌳 本章知识结构
      </div>
      <div style={{
        background: 'rgba(25,200,185,.03)',
        border: '1px dashed var(--animal-border-color-light, #e8e2d6)',
        borderRadius: 18,
        padding: '14px 16px',
        fontFamily: '"Cascadia Code", "Fira Code", monospace',
        fontSize: 11,
        lineHeight: 1.8,
        color: 'var(--animal-text-color, #794f27)',
        whiteSpace: 'pre-wrap',
        overflowX: 'auto',
      }}>
        {tree.split('\n').map((line, i) => {
          const isStar = line.includes('★');
          return (
            <div key={i} style={{
              color: isStar ? 'var(--animal-primary-color, #19c8b9)' : undefined,
              fontWeight: isStar ? 700 : undefined,
            }}>
              {line}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
