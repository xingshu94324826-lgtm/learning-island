import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "animal-island-ui";
import AppShell from "../components/AppShell";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { useProgress } from "../contexts/ProgressContext";
import knowledgeData from "../data/knowledge.json";
import type { KnowledgeBase, KnowledgePoint } from "../types";

const data = knowledgeData as KnowledgeBase;

export default function QuickQuizPage() {
  const navigate = useNavigate();
  const { progress, updateMastery } = useProgress();

  // Flatten all KPs for random selection
  const allKPs = useMemo(() => {
    const kps: KnowledgePoint[] = [];
    for (const sub of data.subjects) {
      for (const ch of sub.chapters) {
        for (const kp of ch.knowledgePoints) {
          if (kp.content.length > 10) kps.push(kp);
        }
      }
    }
    return kps;
  }, []);

  const [currentKp, setCurrentKp] = useState<KnowledgePoint>(() =>
    allKPs[Math.floor(Math.random() * allKPs.length)]
  );
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [total, setTotal] = useState(0);

  const pickNext = useCallback(() => {
    const next = allKPs[Math.floor(Math.random() * allKPs.length)];
    setCurrentKp(next);
    setRevealed(false);
  }, [allKPs]);

  const handleReveal = () => setRevealed(true);

  const handleCorrect = () => {
    setCorrectCount((c) => c + 1);
    setTotal((t) => t + 1);
    pickNext();
  };

  const handleWrong = () => {
    setWrongCount((c) => c + 1);
    setTotal((t) => t + 1);
    // Auto-mark as low mastery
    const current = progress[currentKp.id];
    if (!current || current.mastery < 2) {
      updateMastery(currentKp.id, 1);
    }
    pickNext();
  };

  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // Importance stars display
  const stars = currentKp.importance >= 3 ? "★".repeat(currentKp.importance) : "";

  return (
    <AppShell>
      {/* Stats bar */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 16, marginBottom: 16,
        fontSize: 13, color: "var(--animal-text-color-secondary, #9f927d)",
      }}>
        <span>✅ {correctCount}</span>
        <span>❌ {wrongCount}</span>
        <span>📊 正确率 {accuracy}%</span>
      </div>

      {/* Question card */}
      <Card style={{ padding: 24, textAlign: "center" }}>
        {/* Title */}
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
          {stars && <span style={{ color: "#f5c31c", marginRight: 6 }}>{stars}</span>}
          {currentKp.title}
        </div>

        {/* Tags */}
        {currentKp.tags && currentKp.tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
            {currentKp.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 8,
                background: "#e6f9f6", color: "#0d9488",
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Reveal button */}
        {!revealed ? (
          <div style={{ margin: "20px 0 8px" }}>
            <div style={{ fontSize: 12, color: "var(--animal-text-color-secondary, #9f927d)", marginBottom: 12 }}>
              🤔 脑中回忆一下这个考点，然后揭晓答案
            </div>
            <Button type="primary" size="large" onClick={handleReveal}>
              💡 揭晓答案
            </Button>
          </div>
        ) : (
          <>
            {/* Answer content */}
            <div style={{
              textAlign: "left", margin: "16px 0", padding: 16,
              background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb",
            }}>
              <MarkdownRenderer content={currentKp.content} />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
              <Button type="default" onClick={handleWrong} style={{ background: "#fff0f0", borderColor: "#fecaca" }}>
                ✗ 没记住
              </Button>
              <Button type="primary" onClick={handleCorrect}>
                ✓ 会了
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Bottom actions */}
      <div style={{ textAlign: "center", marginTop: 16, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <Button type="default" size="small" onClick={() => navigate("/review")}>
          📋 弱点攻克
        </Button>
        <Button type="default" size="small" onClick={() => navigate("/")}>
          🏝️ 回首页
        </Button>
      </div>
    </AppShell>
  );
}
