import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Collapse } from 'animal-island-ui';
import AppShell from '../components/AppShell';

// 教学设计模板类型
const TEMPLATES = [
  {
    id: 'general',
    title: '📋 教学设计一般模式',
    content: `一、学习需要分析
分析教学的必要性和可行性。回答"为什么要教/学这个？"

二、教学内容分析
① 归类分析法（知识类型分类）
② 图解分析法（逻辑关系图示）
③ 层级分析法（先决条件层级）
④ 信息加工分析法（认知步骤）
⑤ ISM分析法（解释结构模型）

三、学习者分析
最重要：学习风格分析（场依存/场独立、冲动/沉思等）
还包括：已有知识基础、认知发展水平、学习动机

四、学习目标阐明
将目标具体化、层次化
布卢姆三领域：认知（知道→领会→运用→分析→综合→评价）
加涅五结果：言语信息/智力技能/认知策略/动作技能/态度

五、教学策略制定
三大特性：针对性、灵活性、组合性

六、教学媒体选择
基本原则：根据媒体特性和教学功能做最优选择

七、学习评价
对学生学习成就变化的价值判断
形成性评价（过程中）+ 总结性评价（结束后）

八、教学设计成果评价
确定标准→收集信息→判断质量

★ 四大基本要素：学习者、目标、策略、评价
（四要素一致性是教学设计的灵魂）`,
  },
  {
    id: 'webquest',
    title: '🌐 WebQuest 教学设计模板',
    content: `一、导言（Introduction）
创设问题情境，激发学生兴趣，简要说明任务背景

二、任务（Task）
明确可完成、有趣的任务，要有挑战性但不过难

三、过程（Process）
① 将学生分组（每组3-5人）
② 分配角色/任务
③ 提供具体的步骤指引
④ 每个步骤明确时间节点

四、资源（Resources）
提供精选的网络资源链接（避免学生无目的搜索）
可包括：网页、数据库、电子书、视频等

五、评价（Evaluation）
使用量规（Rubric）评价
包含：个人表现/小组合协作/成果质量 三个维度

六、总结（Conclusion）
① 总结本课学习的知识
② 鼓励学生反思学习过程
③ 提出拓展思考问题`,
  },
  {
    id: 'blended',
    title: '🔄 混合式教学设计模板',
    content: `线上环节（课前）：
① 观看教学视频/课件（15-20分钟）
② 完成在线小测验（检测预习效果）
③ 在讨论区提交疑问

线下环节（课堂）：
① 答疑解惑（针对线上问题集中解答）
② 小组协作探究（深度讨论/案例分析）
③ 成果展示与互评
④ 教师精讲提炼

线上环节（课后）：
① 完成拓展作业
② 在线讨论与反思
③ 下节课预习

关键原则：
- 线上线下内容不重复，各司其职
- 线上重知识传递，线下重深度互动
- 数据贯通：线上学习数据指导线下教学`,
  },
];

const HOT_TOPICS = [
  {
    id: 'aigc',
    title: '🤖 AIGC 与大模型教育应用',
    content: `核心观点：
① AIGC（生成式AI）正在重塑教育形态，从"人找知识"到"知识找人"
② 大语言模型（如GPT）可实现：个性化答疑、智能出题、作文批改、学习路径规划
③ 教育关注点从"知识传授"转向"批判性思维+创造力+人机协作能力"

潜在风险：
- 学术诚信（学生用AI代写作业）
- 信息可靠性（AI"幻觉"生成虚假信息）
- 师生关系重构（AI会不会取代教师？）

应对策略：
- 教师角色升级为"引导者+审核者"
- 将AI素养纳入信息素养教育
- 技术与人本主义的辩证统一`,
  },
  {
    id: 'smartAgent',
    title: '🧠 教育智能体（AI Agent）',
    content: `定义：
教育多智能体系统是由多个相互作用的智能体组成的教学系统，
每个智能体具有自主性、反应性和社会性。

特征（区别于传统AI）：
① 自主性：无需人工干预即可完成教学任务
② 协作性：多智能体之间可以互通、协商
③ 适应性：根据学习者反馈动态调整教学策略
④ 个性化：每个学生有专属智能助教

未来展望：
① 透明性：智能体的决策过程可解释
② 可靠性：输出内容需经人工审核确认
③ 评估体系：建立智能体教育效果的评估标准`,
  },
  {
    id: 'digitalLiteracy',
    title: '💻 教师数字素养与数字化转型',
    content: `教育数字化转型的核心：
从"信息技术辅助教学"转为"信息技术重塑教育生态"

教师数字素养框架：
① 数字意识：认识数字技术对教育的变革性影响
② 数字技术知识与技能：掌握常用数字工具和平台
③ 数字化应用：能将数字技术融入教学设计
④ 数字社会责任：关注数据隐私、数字鸿沟、伦理问题
⑤ 专业发展：持续学习新技术，更新教学理念

实施路径：
- 顶层设计→基础设施建设→资源开发→教师培训→应用推广
- 重点：是"人"的转型，不是"设备"的采购`,
  },
  {
    id: 'coreLiteracy',
    title: '🎯 核心素养导向的教学改革',
    content: `中国学生发展核心素养框架：
三大维度 → 六大素养 → 十八个基本要点

文化基础 → 人文底蕴 + 科学精神
自主发展 → 学会学习 + 健康生活
社会参与 → 责任担当 + 实践创新

对教学的启示：
① 从"知识本位"转向"素养本位"
② 强调跨学科整合（STEAM教育）
③ 项目式学习（PBL）成为重要教学方式
④ 评价改革：从纸笔测验转向表现性评价
⑤ 信息技术作为素养培养的工具，而非目标`,
  },
];

export default function TemplatePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'templates' | 'hotTopics'>('templates');

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Button type="text" onClick={() => navigate('/')}>← 返回</Button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--animal-text-color, #794f27)' }}>
          📐 模板 & 热点
        </h2>
      </div>

      {/* Tab switch */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Button type={tab === 'templates' ? 'primary' : 'default'} onClick={() => setTab('templates')}>
          📋 教学设计模板
        </Button>
        <Button type={tab === 'hotTopics' ? 'primary' : 'default'} onClick={() => setTab('hotTopics')}>
          🔥 热点专题
        </Button>
      </div>

      {/* Templates */}
      {tab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TEMPLATES.map(t => (
            <Card key={t.id} color="default">
              <Collapse
                question={
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</span>
                }
                answer={
                  <div style={{
                    fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap',
                    color: 'var(--animal-text-color-secondary, #6b5e4a)',
                    background: 'rgba(25,200,185,.03)', padding: '12px 14px',
                    borderRadius: 10, marginTop: 8,
                  }}>
                    {t.content}
                  </div>
                }
                defaultExpanded={false}
              />
            </Card>
          ))}
          <Card color="app-teal" style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: '#fff' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>💡 第三轮复习建议</div>
              ① 背诵上述模板的框架结构（不要求逐字逐句）<br/>
              ② 拿到真题大题 → 快速判断用哪个模板<br/>
              ③ 填充具体内容 → 计时完成（30分钟/道）<br/>
              ④ 对照参考答案修正 → 重点关注"漏了哪个设计要素"<br/>
              ⑤ 热点专题背关键词和核心观点，考场用自己的话展开
            </div>
          </Card>
        </div>
      )}

      {/* Hot Topics */}
      {tab === 'hotTopics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {HOT_TOPICS.map(t => (
            <Card key={t.id} color="default">
              <Collapse
                question={
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</span>
                }
                answer={
                  <div style={{
                    fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap',
                    color: 'var(--animal-text-color-secondary, #6b5e4a)',
                    background: 'rgba(25,200,185,.03)', padding: '12px 14px',
                    borderRadius: 10, marginTop: 8,
                  }}>
                    {t.content}
                  </div>
                }
                defaultExpanded={false}
              />
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
