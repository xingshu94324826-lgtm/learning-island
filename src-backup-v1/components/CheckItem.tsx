import React from 'react';

interface CheckItemProps {
  text: string;
  checked?: boolean;
  onToggle?: () => void;
}

export default function CheckItem({ text, checked = false, onToggle }: CheckItemProps) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: '#fff',
        borderRadius: 14,
        border: '2px solid var(--animal-border-color-light, #e8e2d6)',
        marginBottom: 6,
        fontSize: 13,
        transition: 'all .15s cubic-bezier(.4,0,.2,1)',
        cursor: 'pointer',
        opacity: checked ? 0.7 : 1,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        border: '2px solid var(--animal-border-color, #aaa69d)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s cubic-bezier(.4,0,.2,1)',
        background: checked ? 'var(--animal-primary-color, #19c8b9)' : 'transparent',
        borderColor: checked ? 'var(--animal-primary-color, #19c8b9)' : 'var(--animal-border-color, #aaa69d)',
        color: checked ? '#fff' : 'transparent',
        fontWeight: 700,
        fontSize: 12,
      }}>
        ✓
      </div>
      <span style={{
        color: 'var(--animal-text-color, #794f27)',
        textDecoration: checked ? 'line-through' : 'none',
      }}>
        {text}
      </span>
    </div>
  );
}
