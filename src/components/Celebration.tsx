import React, { useEffect, useState } from 'react';
import { Card } from 'animal-island-ui';

const EMOJIS = ['🎉', '⭐', '🍃', '✨', '🏆', '🌟', '💚', '🎊'];

interface CelebrationProps {
  show: boolean;
  message?: string;
  onClose?: () => void;
}

export default function Celebration({ show, message, onClose }: CelebrationProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; e: string; delay: number }[]>([]);

  useEffect(() => {
    if (!show) return;
    const pieces = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      e: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      delay: Math.random() * 0.4,
    }));
    setConfetti(pieces);
    if (onClose) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="celebrate-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.15)',
    }}>
      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} className="confetti-piece" style={{
          left: `${c.x}%`, bottom: '40%',
          fontSize: 24,
          animationDelay: `${c.delay}s`,
        }}>
          {c.e}
        </div>
      ))}

      <Card color="app-green" style={{ maxWidth: 320, textAlign: 'center', padding: '32px 28px', zIndex: 1 }}>
        <div className="celebrate-emoji" style={{ fontSize: 48 }}>🎉</div>
        <div style={{ fontSize: 16, fontWeight: 800, marginTop: 10, color: '#fff' }}>
          {message || '太棒了！'}
        </div>
        <div style={{ fontSize: 12, marginTop: 6, opacity: 0.85 }}>
          你攻克了本章所有薄弱点！
        </div>
      </Card>
    </div>
  );
}
