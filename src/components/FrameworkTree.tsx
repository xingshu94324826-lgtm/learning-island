import React, { useMemo } from 'react';
import { Card } from 'animal-island-ui';
import type { KnowledgePoint } from '../types';

interface TreeNode {
  index: number;
  depth: number;
  rawText: string;
  cleanText: string;
  isConnector: boolean;
  matchedKpId: string | null;
}

interface FrameworkTreeProps {
  tree: string;
  knowledgePoints?: KnowledgePoint[];
  onNodeClick?: (kpId: string) => void;
  /** KP IDs that have unresolved weak points — highlighted in red */
  weakKpIds?: Set<string>;
}

// ── Parsing ──

function parseFrameworkTree(tree: string, kps: KnowledgePoint[]): TreeNode[] {
  const lines = tree.split('\n');
  const nodes: TreeNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      nodes.push({ index: i, depth: 0, rawText: '', cleanText: '', isConnector: true, matchedKpId: null });
      continue;
    }

    const indent = line.search(/\S/);
    const depth = Math.max(0, Math.floor(indent / 4));
    const trimmed = line.trimStart();

    let text: string;
    let isConnector = false;

    if (trimmed.startsWith('├── ') || trimmed.startsWith('└── ')) {
      text = trimmed.substring(4).trim();
    } else if (trimmed.startsWith('┌── ')) {
      text = trimmed.substring(4).trim();
    } else if (trimmed === '│' || trimmed === '│  ' || trimmed === '') {
      isConnector = true;
      text = '';
    } else if (trimmed.startsWith('│  ') || trimmed.startsWith('│ ')) {
      text = trimmed.replace(/^│\s*/, '').trim();
    } else if (trimmed.startsWith('│')) {
      text = trimmed.substring(1).trim();
    } else {
      // Root-level text or continuation
      text = trimmed;
    }

    const rawText = line;
    const cleanText = normalizeText(text);

    // Match against KnowledgePoints
    const matchedKpId = cleanText && cleanText.length >= 2
      ? matchToKP(cleanText, kps)
      : null;

    nodes.push({ index: i, depth, rawText, cleanText, isConnector, matchedKpId });
  }

  return nodes;
}

// ── Text matching ──

function normalizeText(text: string): string {
  return text
    .replace(/★/g, '')
    .replace(/[☆（()）《》「」●]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchToKP(nodeText: string, kps: KnowledgePoint[]): string | null {
  const n = nodeText.toLowerCase();
  if (n.length < 2) return null;

  // Tier 1: exact match after normalization
  for (const kp of kps) {
    const k = normalizeText(kp.title).toLowerCase();
    if (k === n) return kp.id;
  }

  // Tier 2: one contains the other (substring, min 4 chars)
  for (const kp of kps) {
    const k = normalizeText(kp.title).toLowerCase();
    if (k.length >= 4 && n.length >= 4) {
      if (k.includes(n) || n.includes(k)) return kp.id;
    }
  }

  // Tier 3: first 60% prefix match (min 6 chars compact)
  const nCompact = n.replace(/\s/g, '');
  if (nCompact.length >= 6) {
    for (const kp of kps) {
      const kCompact = normalizeText(kp.title).toLowerCase().replace(/\s/g, '');
      if (kCompact.length >= 6) {
        const minLen = Math.min(kCompact.length, nCompact.length);
        const checkLen = Math.floor(minLen * 0.6);
        if (kCompact.substring(0, checkLen) === nCompact.substring(0, checkLen)) {
          return kp.id;
        }
      }
    }
  }

  return null;
}

// Match weak point texts to KP IDs
function resolveWeakKpIds(weakPoints: string[], kps: KnowledgePoint[]): Set<string> {
  const ids = new Set<string>();
  for (const wp of weakPoints) {
    const id = matchToKP(wp, kps);
    if (id) ids.add(id);
  }
  return ids;
}

// ── Component ──

export default function FrameworkTree({ tree, knowledgePoints = [], onNodeClick, weakKpIds }: FrameworkTreeProps) {
  if (!tree) return null;

  const nodes = useMemo(
    () => parseFrameworkTree(tree, knowledgePoints),
    [tree, knowledgePoints]
  );

  const handleClick = (kpId: string) => {
    if (onNodeClick) {
      onNodeClick(kpId);
      return;
    }
    // Fallback: scroll to the KP card
    const el = document.querySelector(`[data-kp-id="${kpId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('kp-highlight');
      setTimeout(() => el.classList.remove('kp-highlight'), 1500);
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 14, fontWeight: 700,
        color: 'var(--animal-text-color, #794f27)',
        marginBottom: 10,
      }}>
        🌳 本章知识结构
        {nodes.some(n => n.matchedKpId) && (
          <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--animal-text-color-secondary, #9f927d)', marginLeft: 8 }}>
            点击节点可跳转到对应考点
          </span>
        )}
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
        overflowX: 'auto',
      }}>
        {nodes.map((node) => {
          const isClickable = node.matchedKpId !== null && !node.isConnector;
          const isWeak = node.matchedKpId !== null && weakKpIds?.has(node.matchedKpId);
          const hasStar = node.rawText.includes('★');

          return (
            <div
              key={node.index}
              className={isClickable ? 'tree-node-clickable' : undefined}
              onClick={isClickable ? () => handleClick(node.matchedKpId!) : undefined}
              style={{
                paddingLeft: node.depth * 16,
                paddingRight: 4,
                color: isWeak
                  ? '#fc736d'
                  : isClickable
                    ? 'var(--animal-primary-color, #19c8b9)'
                    : hasStar
                      ? 'var(--animal-primary-color, #19c8b9)'
                      : undefined,
                fontWeight: isWeak ? 700 : isClickable ? 600 : hasStar ? 700 : undefined,
                cursor: isClickable ? 'pointer' : undefined,
                whiteSpace: 'pre',
              }}
            >
              {isWeak && <span style={{ fontSize: 9, marginRight: 2 }}>⚠️</span>}
              {node.rawText || ' '}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
