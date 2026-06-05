import React, { useState } from 'react';
import { Card, Button } from 'animal-island-ui';
import MarkdownRenderer from './MarkdownRenderer';

interface FlashCardProps {
  question: string;
  answer: string;
  index: number;
  total: number;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function FlashCard({ question, answer, index, total, onCorrect, onWrong }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => setFlipped(!flipped);

  const handleCorrect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCorrect();
    setFlipped(false);
  };

  const handleWrong = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWrong();
    setFlipped(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: 12, color: 'var(--animal-text-color-secondary, #9f927d)', marginBottom: 12 }}>
        第 {index + 1}/{total} 张
      </div>
      <Card
        onClick={handleFlip}
        style={{
          width: '100%', maxWidth: 420, minHeight: 180,
          cursor: 'pointer', textAlign: 'center',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px',
          position: 'relative',
          transition: 'all .3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <div style={{
          position: 'absolute', top: 8, right: 12,
          fontSize: 16, animation: 'leafWiggle 3s ease-in-out infinite', opacity: 0.6,
        }}>
          🍃
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          {flipped ? (
            <div style={{ textAlign: 'left', fontWeight: 400, fontSize: 14 }}>
              <MarkdownRenderer content={answer} />
            </div>
          ) : question}
        </div>
        {!flipped && (
          <div style={{ fontSize: 11, color: 'var(--animal-text-color-secondary, #9f927d)' }}>
            👆 点击翻转查看答案
          </div>
        )}
      </Card>
      <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
        <Button type="default" danger onClick={handleWrong}>
          ❌ 不确定
        </Button>
        <Button type="primary" size="large" onClick={handleCorrect}>
          ✅ 记住了
        </Button>
      </div>
    </div>
  );
}
