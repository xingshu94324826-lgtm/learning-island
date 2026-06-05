import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'animal-island-ui';
import AppShell from '../components/AppShell';

interface Version {
  version: string;
  date: string;
  changes: string[];
  tag: 'feature' | 'fix' | 'content' | 'refactor';
}

const VERSIONS: Version[] = [
  {
    version: 'v2.0', date: '2026-06-05',
    tag: 'feature',
    changes: [
      '考点卡片支持 1-5 级掌握度标记 + 个人笔记（ProgressContext）',
      '首页 Dashboard：总掌握度圆环 + 三轮学习进度条 + 已标记考点统计',
      '框架树弱项节点红色高亮（⚠️ 标记未解决薄弱点）',
      '一键导出个人知识档案（Markdown，含框架树+掌握度+笔记+薄弱点）',
      '真题问答练习模式：随机高频术语→打字输出→对照标准答案',
      '知识图谱 Tag 标签云：34 个核心概念跨三科自动打标，点击 tag 查看跨章关联',
      '闪卡"薄弱章节"筛选模式：只刷有未解决薄弱点的章节',
      '自动打标签系统：parse-cards.ts 从标题+内容匹配 40 组关键词',
    ],
  },
  {
    version: 'v1.3', date: '2026-06-04',
    tag: 'feature',
    changes: [
      '真题页上下线：列表浏览 + 逐题翻转卡（弱项池独立存储）',
      '模板页新增：3 套教学设计模板（通用/WebQuest/混合式）+ 4 个热点专题',
      '首页三轮学习模式切换器',
      '"原文出处"徽章：每章 ChapterHero 显示教材引用（15 章全覆盖）',
      '知识框架树可点击：节点→考点卡片平滑滚动+高亮',
    ],
  },
  {
    version: 'v1.2', date: '2026-06-03',
    tag: 'fix',
    changes: [
      '修复框架树数据缺失（parse-cards 代码块解析 bug + 匹配词"本单元框架""两章框架"等变体）',
      '修复考点内容污染——每章最后考点混入易错点/薄弱点垃圾数据',
      '修复表格行标签列被截断（`2×3` 模型信息化列不显示）',
      '修复闪卡问题以数字开头格式差',
      '第 2 章内容补充：媒体论↔过程论、信息化三大特征、AECT\'94 中国扩展、戴尔经验之塔五要点',
      '第 5 章补充框架树',
    ],
  },
  {
    version: 'v1.1', date: '2026-05-XX',
    tag: 'feature',
    changes: [
      '学习之岛首次部署 GitHub Pages',
      '基础页面：HomePage / SubjectPage / FlashcardsPage / SearchPage / GraphPage',
      '知识卡片编译系统：parse-cards.ts（15 张 MD → knowledge.json）',
      '薄弱点勾选 + localStorage 持久化',
      '闪卡系统：翻转卡 + 弱项池',
      'Fuse.js 全文搜索 + 薄弱点优先级列表',
      '自定义 Markdown 渲染器（表格/代码块/引用）',
    ],
  },
  {
    version: 'v1.0', date: '2026-04-XX',
    tag: 'content',
    changes: [
      '15 张知识卡片完成（教育技术学 5 章 + 教学系统设计 6 单元 + 研究方法 4 章）',
      '729 教育技术学学长资料全文提取',
      '数据结构设计：Subject → Chapter → KnowledgePoint → FlashCard',
      'animal-island-ui 动物之森主题集成',
    ],
  },
];

function tagColor(tag: Version['tag']) {
  switch (tag) {
    case 'feature': return '#6fba2c';
    case 'fix': return '#fc736d';
    case 'content': return '#889df0';
    case 'refactor': return '#f5c31c';
  }
}

function tagLabel(tag: Version['tag']) {
  switch (tag) {
    case 'feature': return '功能';
    case 'fix': return '修复';
    case 'content': return '内容';
    case 'refactor': return '重构';
  }
}

export default function ChangelogPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Button type="text" onClick={() => navigate('/')}>← 返回</Button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--animal-text-color, #794f27)' }}>
          📋 更新日志
        </h2>
      </div>

      <Card color="app-teal" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, lineHeight: 1.8, color: '#fff' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>📊 项目统计</div>
          总迭代：{VERSIONS.length} 个大版本<br />
          跨越：2 个月（4月→6月）<br />
          从"静态知识库"到"学习诊断系统"<br />
          三科知识卡片 + 自动标签 + 掌握度追踪 + 真题练习 + 框架树导航 + 一键导出
        </div>
      </Card>

      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 19, top: 0, bottom: 0, width: 2,
          background: 'var(--animal-border-color-light, #e8e2d6)',
        }} />

        {VERSIONS.map((v, i) => (
          <div key={v.version} style={{ position: 'relative', paddingLeft: 48, marginBottom: 24 }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute', left: 12, top: 4, width: 16, height: 16, borderRadius: '50%',
              background: tagColor(v.tag), border: '3px solid #fff',
              boxShadow: '0 0 0 2px ' + tagColor(v.tag),
            }} />

            <Card color="default" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--animal-text-color, #794f27)' }}>
                  {v.version}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                  background: tagColor(v.tag) + '1a', color: tagColor(v.tag),
                }}>
                  {tagLabel(v.tag)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--animal-text-color-secondary, #9f927d)', marginLeft: 'auto' }}>
                  {v.date}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 2 }}>
                {v.changes.map((c, j) => (
                  <li key={j} style={{ color: 'var(--animal-text-color-secondary, #6b5e4a)' }}>{c}</li>
                ))}
              </ul>
            </Card>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
