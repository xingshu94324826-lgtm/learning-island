import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Cursor, Footer, Button } from 'animal-island-ui';
import '../styles/animations.css';
import knowledgeData from '../data/knowledge.json';

interface AppShellProps {
  children: React.ReactNode;
  showLeaves?: boolean;
}

const NAV_BAR: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: 20,
};

const SHELL: React.CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '20px 20px 40px',
};

const HEADER: React.CSSProperties = {
  textAlign: 'center',
  padding: '24px 0 8px',
};

const SKYLINE: React.CSSProperties = {
  fontSize: 40,
  letterSpacing: 4,
  animation: 'float 3s ease-in-out infinite',
  display: 'inline-block',
};

const TITLE: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: 'var(--animal-text-color, #794f27)',
  marginTop: 4,
};

const SUBTITLE: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--animal-text-color-secondary, #9f927d)',
  marginTop: 2,
};

const LEAF_BASE: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 0,
  animation: 'float 4s ease-in-out infinite',
  opacity: 0.15,
  fontSize: 32,
};

const BOTTOM: React.CSSProperties = {
  marginTop: 40,
  textAlign: 'center',
  color: 'var(--animal-text-color-secondary, #9f927d)',
  fontSize: 11,
  padding: '20px 0',
};

const NAV_ITEMS = [
  { path: '/', label: '🏝️ 首页' },
  { path: '/quick', label: '⚡ 速测' },
  { path: '/review', label: '🎯 弱点' },
  { path: '/search', label: '🔍 搜索' },
];

export default function AppShell({ children, showLeaves = true }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const counts = React.useMemo(() => {
    const subs = knowledgeData.subjects.length;
    const chs = knowledgeData.subjects.reduce((s, sub) => s + sub.chapters.length, 0);
    const kps = knowledgeData.subjects.reduce((s, sub) =>
      s + sub.chapters.reduce((cs, ch) => cs + ch.knowledgePoints.length, 0), 0);
    return `${subs} 科目 · ${chs} 章 · ${kps} 考点`;
  }, []);

  return (
    <Cursor>
      {showLeaves && (
        <>
          <div style={{ ...LEAF_BASE, top: '15%', left: '5%' }}>🍃</div>
          <div style={{ ...LEAF_BASE, top: '25%', right: '5%', animationDelay: '1.5s' }}>🌿</div>
          <div style={{ ...LEAF_BASE, top: '45%', left: '50%', fontSize: 20, opacity: 0.08, animationDelay: '0.8s' }}>🍂</div>
        </>
      )}
      <div style={SHELL}>
        <div style={HEADER}>
          <div style={SKYLINE}>🏝️</div>
          <div style={TITLE}>729 教育技术学 · 学习之岛</div>
          <div style={SUBTITLE}>像探索无人岛一样，发现每一个知识点</div>
        </div>

        {/* Top Nav */}
        <div style={NAV_BAR}>
          {NAV_ITEMS.map(item => (
            <Button
              key={item.path}
              type={location.pathname === item.path ? 'primary' : 'default'}
              size="small"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {children}

        <div style={BOTTOM}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🌴 🏠 🌊</div>
          <div>729 教育技术学 · 共 {counts} · 知识岛屿欢迎你回来</div>
        </div>
      </div>
      <Footer type="sea" />
    </Cursor>
  );
}
