// src/components/KnowledgeCard.tsx
import React, { useState } from 'react';
import { Collapse, Button, Input } from 'animal-island-ui';
import MarkdownRenderer from './MarkdownRenderer';
import type { KnowledgePoint } from '../types';
import { useProgress, MasteryLevel } from '../contexts/ProgressContext';

interface KnowledgeCardProps {
  kp: KnowledgePoint;
  defaultExpanded?: boolean;
}

const COLOR_BORDER: Record<string, string> = {
  red: '#fc736d', blue: '#889df0', green: '#8ac68a', yellow: '#f7cd67',
};

const masteryColors = ['#e8e2d6', '#fc736d', '#f5c31c', '#19c8b9', '#6fba2c', '#4ade80'];

export default function KnowledgeCard({ kp, defaultExpanded = false }: KnowledgeCardProps) {
  const { progress, updateMastery, addNote, deleteNote } = useProgress();
  const currentProgress = progress[kp.id] || { mastery: 0, notes: [] };
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const borderColor = COLOR_BORDER[kp.color] || '#e8e2d6';

  const handleMasteryChange = (level: MasteryLevel) => {
    updateMastery(kp.id, level);
  };

  const handleAddNote = () => {
    if (noteInput.trim()) {
      addNote(kp.id, noteInput);
      setNoteInput('');
      setShowNoteInput(false);
    }
  };

  return (
    <div style={{ marginBottom: 12, borderLeft: `4px solid ${borderColor}`, borderRadius: '0 16px 16px 0', background: '#fff' }}>
      <Collapse
        question={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{kp.title}</span>
            
            {/* 掌握度快速选择 */}
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(level => (
                <button
                  key={level}
                  onClick={(e) => { e.stopPropagation(); handleMasteryChange(level as MasteryLevel); }}
                  style={{
                    width: 24, height: 24, borderRadius: 6, border: 'none',
                    background: currentProgress.mastery >= level ? masteryColors[level] : '#f1f1f1',
                    color: currentProgress.mastery >= level ? '#fff' : '#999',
                    fontSize: 12, cursor: 'pointer'
                  }}
                  title={`掌握度 ${level}`}
                >
                  {level}
                </button>
              ))}
            </div>

            {kp.importance >= 3 && <span style={{color: '#f5c31c'}}>{'★'.repeat(kp.importance)}</span>}
          </div>
        }
        answer={
          <div>
            <MarkdownRenderer content={kp.content} />

            {/* 掌握度显示 */}
            <div style={{ margin: '12px 0', padding: '8px', background: '#f8f9fa', borderRadius: 8 }}>
              当前掌握度: <strong style={{color: masteryColors[currentProgress.mastery]}}>
                {currentProgress.mastery === 0 ? '未标记' : `${currentProgress.mastery}/5`}
              </strong>
            </div>

            {/* 笔记区 */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>个人笔记 / 补充 / 纠错</span>
                <Button type="default" size="small" onClick={() => setShowNoteInput(!showNoteInput)}>
                  + 添加笔记
                </Button>
              </div>

              {showNoteInput && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <Input
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="记录你的理解、补充或发现的错误..."
                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleAddNote()}
                  />
                  <Button type="primary" onClick={handleAddNote}>保存</Button>
                </div>
              )}

              {currentProgress.notes.length > 0 && (
                <div style={{ maxHeight: 200, overflow: 'auto' }}>
                  {currentProgress.notes.map(note => (
                    <div key={note.id} style={{ 
                      padding: 10, marginBottom: 8, background: '#fff', 
                      border: '1px solid #eee', borderRadius: 8, fontSize: 13 
                    }}>
                      <div>{note.content}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                        <span style={{ marginLeft: 12, cursor: 'pointer', color: '#fc736d' }}
                          onClick={() => deleteNote(kp.id, note.id)}>删除</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
        defaultExpanded={defaultExpanded}
      />
    </div>
  );
}