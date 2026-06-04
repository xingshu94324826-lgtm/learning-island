import React from 'react';
import { Card } from 'animal-island-ui';

interface NpcBubbleProps {
  children: React.ReactNode;
  avatar?: string;
  name?: string;
}

export default function NpcBubble({ children, avatar = '🦝', name = 'Tommy · 知识向导' }: NpcBubbleProps) {
  return (
    <Card color="default" style={{ marginBottom: 16, position: 'relative' }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: 'var(--animal-primary-color, #19c8b9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, position: 'absolute', top: -21, left: 20,
        border: '3px solid #fff',
        boxShadow: 'var(--animal-shadow-sm)',
      }}>
        {avatar}
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{
          fontSize: 10, color: 'var(--animal-text-color-secondary, #9f927d)',
          textTransform: 'uppercase', letterSpacing: 2,
        }}>
          {name}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, marginTop: 4 }}>
          {children}
        </div>
      </div>
    </Card>
  );
}
