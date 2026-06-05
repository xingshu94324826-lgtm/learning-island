import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Collapse } from "animal-island-ui";
import AppShell from "../components/AppShell";
import KnowledgeCard from "../components/KnowledgeCard";
import FlashCard from "../components/FlashCard";
import { useMastery } from "../hooks/useMastery";
import { useProgress } from "../contexts/ProgressContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import knowledgeData from "../data/knowledge.json";
import type { KnowledgeBase, KnowledgePoint } from "../types";

const data = knowledgeData as KnowledgeBase;

type Tab = "weak" | "mastery" | "flashcard" | "exam";

export default function ReviewPage() {
  const navigate = useNavigate();
  const mastery = useMastery();
  const { progress, getDueReviews } = useProgress();
  const [fcWeakPool] = useLocalStorage<string[]>("fc-weak-pool", []);
  const [examWeakPool] = useLocalStorage<string[]>("exam-weak-pool", []);
  const [checkedWeakPoints] = useLocalStorage<Record<string, string[]>>("weak-pts-all", {});
  const [activeTab, setActiveTab] = useState<Tab>("weak");

  // Aggregate unresolved weak points across all subjects
  const unresolvedWeakPoints = useMemo(() => {
    const items: { chapterId: string; chapterTitle: string; subjectId: string; subjectName: string; wp: string }[] = [];
    for (const sub of data.subjects) {
      const checked = checkedWeakPoints[`weak-pts-${sub.id}`] || [];
      const checkedSet = new Set(checked);
      for (const ch of sub.chapters) {
        for (const wp of ch.weakPoints) {
          if (!checkedSet.has(wp)) {
            items.push({ chapterId: ch.id, chapterTitle: ch.title, subjectId: sub.id, subjectName: sub.name, wp });
          }
        }
      }
    }
    return items;
  }, [checkedWeakPoints]);

  // Low mastery KPs (mastery < 3)
  const lowMasteryKPs = useMemo(() => {
    const kps: KnowledgePoint[] = [];
    for (const sub of data.subjects) {
      for (const ch of sub.chapters) {
        for (const kp of ch.knowledgePoints) {
          const p = progress[kp.id];
          if (p && p.mastery > 0 && p.mastery < 3) {
            kps.push(kp);
          }
        }
      }
    }
    return kps.sort((a, b) => (progress[a.id]?.mastery || 0) - (progress[b.id]?.mastery || 0));
  }, [progress]);

  // Flashcards in weak pool
  const weakFlashcards = useMemo(() => {
    return data.flashcards.filter(fc => fcWeakPool.includes(fc.id));
  }, [fcWeakPool]);

  // Exam items in weak pool
  const examWeakCount = examWeakPool.length;

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: 12,
    border: "none",
    fontSize: 13,
    fontWeight: activeTab === tab ? 700 : 500,
    background: activeTab === tab ? "var(--animal-primary-color, #19c8b9)" : "#f5f5f5",
    color: activeTab === tab ? "#fff" : "var(--animal-text-color-secondary, #9f927d)",
    cursor: "pointer",
    transition: "all .2s",
  });

  const countStyle: React.CSSProperties = {
    fontSize: 28, fontWeight: 800, lineHeight: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: "var(--animal-text-color-secondary, #9f927d)", marginTop: 2,
  };

  return (
    <AppShell>
      {/* Dashboard */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" }}>
        <Card style={{ flex: "1 1 100px", minWidth: 90, textAlign: "center", padding: 14 }}>
          <div style={countStyle}>{unresolvedWeakPoints.length}</div>
          <div style={labelStyle}>薄弱点待攻克</div>
        </Card>
        <Card style={{ flex: "1 1 100px", minWidth: 90, textAlign: "center", padding: 14 }}>
          <div style={countStyle}>{lowMasteryKPs.length}</div>
          <div style={labelStyle}>低掌握度考点</div>
        </Card>
        <Card style={{ flex: "1 1 100px", minWidth: 90, textAlign: "center", padding: 14 }}>
          <div style={countStyle}>{weakFlashcards.length}</div>
          <div style={labelStyle}>弱项闪卡</div>
        </Card>
        <Card style={{ flex: "1 1 100px", minWidth: 90, textAlign: "center", padding: 14 }}>
          <div style={countStyle}>{examWeakCount}</div>
          <div style={labelStyle}>真题错题</div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <button style={tabStyle("weak")} onClick={() => setActiveTab("weak")}>⚠️ 薄弱点 ({unresolvedWeakPoints.length})</button>
        <button style={tabStyle("mastery")} onClick={() => setActiveTab("mastery")}>📉 低掌握度 ({lowMasteryKPs.length})</button>
        <button style={tabStyle("flashcard")} onClick={() => setActiveTab("flashcard")}>🃏 弱项闪卡 ({weakFlashcards.length})</button>
        <button style={tabStyle("exam")} onClick={() => setActiveTab("exam")}>📝 真题错题 ({examWeakCount})</button>
      </div>

      {/* Tab content */}
      {activeTab === "weak" && (
        <div>
          {unresolvedWeakPoints.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--animal-text-color-secondary, #9f927d)" }}>
              🎉 所有薄弱点已攻克！
            </div>
          ) : (
            Object.entries(
              unresolvedWeakPoints.reduce((acc, item) => {
                const key = `${item.subjectName} · ${item.chapterTitle}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
              }, {} as Record<string, typeof unresolvedWeakPoints>)
            ).map(([group, items]) => (
              <Card key={group} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
                  {group}
                  <Button
                    size="small"
                    style={{ marginLeft: 12, fontSize: 11 }}
                    onClick={() => {
                      const item = items[0];
                      navigate(`/subject/${item.subjectId}`);
                    }}
                  >
                    去学习 →
                  </Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} style={{
                    padding: "8px 12px", marginBottom: 6,
                    background: "#fff7ed", borderRadius: 8, border: "1px solid #fed7aa",
                    fontSize: 13,
                  }}>
                    ⚠️ {item.wp}
                  </div>
                ))}
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "mastery" && (
        <div>
          {lowMasteryKPs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--animal-text-color-secondary, #9f927d)" }}>
              🎉 所有考点掌握度 ≥ 3！
            </div>
          ) : (
            lowMasteryKPs.map(kp => (
              <KnowledgeCard key={kp.id} kp={kp} />
            ))
          )}
        </div>
      )}

      {activeTab === "flashcard" && (
        <div>
          {weakFlashcards.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--animal-text-color-secondary, #9f927d)" }}>
              🎉 没有弱项闪卡！
            </div>
          ) : (
            <>
              <FlashCard
                question={weakFlashcards[0].question}
                answer={weakFlashcards[0].answer}
                index={1}
                total={weakFlashcards.length}
                onCorrect={() => {}}
                onWrong={() => {}}
              />
              <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--animal-text-color-secondary, #9f927d)" }}>
                以上为第一张，共 {weakFlashcards.length} 张弱项闪卡 ·
                <Button size="small" style={{ marginLeft: 8 }} onClick={() => {
                  const subId = data.flashcards.find(fc => fc.id === weakFlashcards[0].id)?.chapterId?.split("-")[0];
                  navigate(`/flashcards/${subId || data.subjects[0].id}`);
                }}>
                  进入闪卡模式 →
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "exam" && (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
            真题错题池中有 {examWeakCount} 道题待复习
          </div>
          <Button type="primary" onClick={() => navigate("/exam")}>
            进入真题练习 →
          </Button>
        </div>
      )}
    </AppShell>
  );
}
