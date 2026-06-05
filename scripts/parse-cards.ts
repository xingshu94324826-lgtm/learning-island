import * as fs from 'fs';
import * as path from 'path';

const CARDS_DIR = 'D:\\my_ai_test\\knowledge-base\\知识卡片\\729-教育技术学';
const OUTPUT_DIR = 'D:\\my_ai_test\\learning-island\\src\\data';
const OUTPUT = path.join(OUTPUT_DIR, 'knowledge.json');

const SUBJECTS: Record<string, { id: string; name: string; icon: string }> = {
  '教育技术学': { id: 'edutech', name: '教育技术学', icon: '📡' },
  '教学系统设计': { id: 'isdesign', name: '教学系统设计', icon: '🎯' },
  '研究方法': { id: 'research', name: '教育技术学研究方法', icon: '🔬' },
};

const SOURCE_REF_MAP: Record<string, Record<number, string>> = {
  edutech: {
    1: '《教育技术学》第一章 1.1-1.2 节',
    2: '《教育技术学》第二章 2.1-2.4 节',
    3: '《教育技术学》第三至四章 3.1-4.2 节',
    5: '《教育技术学》第五章 5.1-5.5 节',
    6: '《教育技术学》第六至十章 6.1-10.3 节',
  },
  isdesign: {
    1: '《教学系统设计》第一单元',
    2: '《教学系统设计》第二单元',
    3: '《教学系统设计》第三单元',
    4: '《教学系统设计》第四单元',
    5: '《教学系统设计》第五单元',
    6: '《教学系统设计》第六单元',
  },
  research: {
    1: '《教育技术学研究方法》第一章',
    2: '《教育技术学研究方法》第二章',
    3: '《教育技术学研究方法》第三章',
    4: '《教育技术学研究方法》第四至六章',
  },
};

// ── Utils ──

function stripMd(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function parseImportance(title: string): number {
  const stars = (title.match(/★/g) || []).length;
  return stars > 0 ? Math.min(stars, 5) : 3;
}

function parseCategory(title: string): 'definition' | 'comparison' | 'theory' | 'method' {
  if (title.includes('定义') || title.includes('概述')) return 'definition';
  if (title.includes('对比') || title.includes('vs') || title.includes('比较')) return 'comparison';
  if (title.includes('理论') || title.includes('基础') || title.includes('论')) return 'theory';
  return 'method';
}

function parseColor(importance: number): 'red' | 'blue' | 'green' | 'yellow' {
  if (importance >= 5) return 'red';
  if (importance >= 3) return 'blue';
  return 'green';
}

// ── Extractors ──

function extractFrameworkTree(lines: string[]): string {
  let tree = '', inBlock = false, fenceSeen = false;
  for (const l of lines) {
    if (l.startsWith('##') && l.includes('框架')) { inBlock = true; fenceSeen = false; continue; }
    if (inBlock && l.trim().startsWith('```')) {
      if (!fenceSeen) { fenceSeen = true; continue; } // opening ``` → skip
      break; // closing ``` → stop
    }
    if (inBlock) tree += l + '\n';
  }
  return tree.trim();
}

function extractKnowledgePoints(chapterId: string, lines: string[]) {
  const kps: { id: string; title: string; content: string[]; importance: number; category: string; color: string; tags: string[] }[] = [];
  let cur: { title: string; content: string[]; importance: number } | null = null;

  let stopKP = false; // guard: once we hit 易错点/薄弱点 section, stop collecting KP content
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);

    // Stop collecting KP content when entering 易错点 or 薄弱点 sections
    if ((h2 || h3) && (line.includes('常见易错点') || line.includes('我的薄弱点'))) {
      if (cur) {
        kps.push({
          id: `${chapterId}-kp${kps.length + 1}`,
          title: stripMd(cur.title),
          content: cur.content.join('\n').trim(),
          importance: cur.importance,
          category: parseCategory(cur.title),
          color: parseColor(cur.importance),
          tags: [],
        });
        cur = null;
      }
      stopKP = true;
      continue;
    }

    if ((h2 || h3) && !line.includes('框架')) {
      if (cur) {
        kps.push({
          id: `${chapterId}-kp${kps.length + 1}`,
          title: stripMd(cur.title),
          content: cur.content.join('\n').trim(),
          importance: cur.importance,
          category: parseCategory(cur.title),
          color: parseColor(cur.importance),
          tags: [],
        });
      }
      const rawTitle = (h2 || h3)![1];
      cur = { title: rawTitle, content: [], importance: parseImportance(rawTitle) };
      stopKP = false;
    } else if (cur && !stopKP && line.trim() && !line.startsWith('##')) {
      cur.content.push(line);
    }
  }
  if (cur) {
    kps.push({
      id: `${chapterId}-kp${kps.length + 1}`,
      title: stripMd(cur.title),
      content: cur.content.join('\n').trim(),
      importance: cur.importance,
      category: parseCategory(cur.title),
      color: parseColor(cur.importance),
      tags: [],
    });
  }
  return kps.filter(kp => kp.content.length > 0);
}

// ── Auto-tagging ──

// Keyword → canonical tag name
const TAG_KEYWORDS: [string[], string][] = [
  [['建构主义', '建构'], '建构主义'],
  [['系统论', '系统方法', '系统科学', '系统观'], '系统论'],
  [['布卢姆', '布鲁姆'], '布卢姆'],
  [['加涅'], '加涅'],
  [['形成性评价'], '形成性评价'],
  [['绩效技术', '绩效'], '绩效技术'],
  [['先行组织者'], '先行组织者'],
  [['信息技术与课程整合', '课程整合', '信息技术与课程深层次整合'], '信息技术与课程整合'],
  [['主导-主体', '主导—主体', '学教并重'], '主导-主体'],
  [['AECT', '94定义', '05定义'], 'AECT定义'],
  [['梅瑞尔', 'CDT', '成分显示理论'], '梅瑞尔'],
  [['戴尔', '经验之塔'], '戴尔经验之塔'],
  [['程序教学'], '程序教学'],
  [['维果斯基', '最近发展区'], '维果斯基'],
  [['ADDIE'], 'ADDIE'],
  [['ARCS', '动机模型', '凯勒'], 'ARCS'],
  [['斯金纳'], '斯金纳'],
  [['奥苏贝尔'], '奥苏贝尔'],
  [['布鲁纳'], '布鲁纳'],
  [['学习风格'], '学习风格'],
  [['量规', '评价量规'], '量规'],
  [['教学媒体', '媒体特性', '媒体选择'], '教学媒体'],
  [['教学设计', '教学系统设计'], '教学设计'],
  [['行为主义'], '行为主义'],
  [['认知主义', '认知学习理论'], '认知主义'],
  [['传播理论', '7W', '布雷多克', '四律'], '传播理论'],
  [['教学处方理论', '郑永柏'], '教学处方理论'],
  [['活动理论', 'Activity Theory'], '活动理论'],
  [['知识管理'], '知识管理'],
  [['学习分析'], '学习分析'],
  [['教育信息化', '信息化教育'], '教育信息化'],
  [['MOOC', '在线课程', '大规模'], 'MOOC'],
  [['翻转课堂'], '翻转课堂'],
  [['深度学习'], '深度学习'],
  [['人工智能', 'AI', '智能'], '人工智能'],
  [['核心素养'], '核心素养'],
  [['混合式学习', 'Blending Learning', 'Blended'], '混合式学习'],
  [['信息素养'], '信息素养'],
  [['学习环境'], '学习环境'],
  [['学习资源', '教学资源'], '学习资源'],

  // 新增：研究方法类
  [['实验研究', '实验法', '实验设计', '实验效度'], '实验研究'],
  [['调查研究', '调查法', '问卷', '抽样'], '调查研究'],
  [['内容分析', '内容分析法', '分析类目'], '内容分析'],
  [['行动研究', '行动研究法', '螺旋循环'], '行动研究'],
  [['研究假设', '假设陈述', '概念化', '操作化'], '研究假设'],
  [['文献检索', '检索工具', '查询方式', '文献级'], '文献检索'],
  [['抽样方法', '抽样'], '抽样方法'],
  [['研究取向', '研究取向'], '研究取向'],

  // 新增：教学设计细节
  [['教学模式', '五要素', '细化理论', '精细加工'], '教学模式'],
  [['教学策略', '生成性', '替代性', '六大依据'], '教学策略'],
  [['学习评价', '学档', '学习契约', '网络评价', '三大家定义'], '学习评价'],
  [['学习者特征', '学段特征', '学习者分析'], '学习者特征'],
  [['前端分析', '学习需要分析', '内容关系', '核心公式'], '前端分析'],
  [['教学过程', '四要素', '教学规律'], '教学过程'],

  // 新增：教技+研究方法
  [['表现形态', '按表现', '本质属性', '按本质'], '教学媒体'],
  [['三种方法对比', '哲学方法', '一般科学方法', '综合研究法', '研究的方法'], '研究方法'],
  [['南国农', '七论', '电化教育', '教育技术内涵'], '教育技术发展'],
  [['三要素', '教育技术学三要素', '学科要素'], '教育技术学'],
  [['四次飞跃', '五次飞跃', '媒体技术'], '教学媒体'],
  [['操作化', '变量设计', '变量测度', '自变量', '因变量', '无关变量'], '研究假设'],
  [['学习需要', '能力差距', '需求分析'], '前端分析'],
  [['认知策略', '元认知', '动机', '态度'], '学习理论'],
  [['素质教育', '创新人才', '核心素养', '立德树人'], '核心素养'],
  [['STEM', 'STEAM', '创客'], '跨学科'],
  [['微格教学', '微型教学', '微教学'], '教学模式'],
  [['项目式学习', 'PBL', '基于项目', '基于问题'], '教学模式'],
  [['认知学徒', '抛锚式', '基于情境', '情境教学', '随机通达', '认知弹性'], '教学模式'],

  // 新增：Cover generic XY titles
  [['起点', '逻辑起点'], '逻辑起点'],
  [['误区', '重电轻教', '重硬轻软', '重教轻学', '偏科技轻人文'], '误区'],
  [['媒体', '五次飞跃', '重大飞跃', '新型媒体', '媒体含义', '印刷媒体', '电子媒体', '数字媒体', '网络媒体'], '教学媒体'],
  [['评价进展', '评价改革', '评价新方向', 'CIPP', '真实性评价', '表现性评价', '成长记录袋', '电子学档'], '学习评价'],
  [['组织者', '内容组织者', '宏策略', '微策略', '概念图', '认知地图'], '教学策略'],
  [['功能', '主要功能', '核心功能', '五大功能', '速记'], '教学媒体'],
  [['文献', '文献级', '原始文献', '二次文献', '三次文献', '检索工具', '查询方式'], '文献检索'],
  [['选题', '选题原则', '研究课题', '课题选择', '四原则'], '科学研究'],
  [['成果分类', '按成果', '课题性质', '课题分类'], '科学研究'],
  [['结构', '四部分', '论文结构', '引用规范', '标题', '摘要', '参考文献', '致谢'], '学术规范'],
  [['哲学基础', '技术主义', '人本主义'], '哲学基础'],
  [['教育技术发展', '发展历史', '四大特点', '发展阶段'], '教育技术发展'],
  [['MiniQuest', 'miniquest', '迷你'], 'MiniQuest'],
  [['基于Web', '网络教学系统', 'WebQuest'], '网络教学'],
  [['开发技术', '印刷技术', '视听技术', '整合技术'], '开发技术'],
  [['引用方式', '研究报告'], '学术规范'],
  [['科学研究', '根本目的', '辩证关系'], '科学研究'],
];

function autoTag(text: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();
  for (const [keywords, tag] of TAG_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      tags.push(tag);
    }
  }
  // De-duplicate
  return [...new Set(tags)];
}

// Secondary pass: fuzzy match using single-word lookups for generic titles
const FUZZY_TAGS: [string, string][] = [
  ['评价', '学习评价'], ['媒体', '教学媒体'], ['学习', '教学设计'],
  ['教学', '教学设计'], ['研究', '科学研究'], ['方法', '科学研究'],
  ['文献', '文献检索'], ['原则', '科学研究'], ['结构', '学术规范'],
];

function fuzzyTag(text: string, existingTags: string[]): string[] {
  const lower = text.toLowerCase();
  const tags = [...existingTags];
  for (const [word, tag] of FUZZY_TAGS) {
    if (!tags.includes(tag) && lower.includes(word.toLowerCase())) {
      tags.push(tag);
    }
  }
  return tags;
}

function tagKnowledgePoints(kps: { id: string; title: string; content: string; tags: string[] }[]) {
  for (const kp of kps) {
    const combined = kp.title + ' ' + kp.content;
    let tags = autoTag(combined);
    if (tags.length < 2) tags = fuzzyTag(combined, tags);
    kp.tags = tags;
  }
}

function extractErrorProne(lines: string[]): string[] {
  const r: string[] = [];
  let on = false;
  for (const l of lines) {
    if (l.includes('常见易错点')) { on = true; continue; }
    if (l.startsWith('## ') || l.includes('我的薄弱点')) { on = false; continue; }
    if (on && l.match(/^\d+\.\s+(.+)/)) r.push(stripMd(l.match(/^\d+\.\s+(.+)/)![1].trim()));
  }
  return r;
}

function extractWeakPoints(lines: string[]): string[] {
  const r: string[] = [];
  let on = false;
  for (const l of lines) {
    if (l.includes('我的薄弱点')) { on = true; continue; }
    if (l.startsWith('## ')) { on = false; continue; }
    if (on && l.includes('- [ ]')) r.push(l.replace(/- \[ \]\s*/, '').trim());
  }
  return r;
}

// ── Parser ──

function parseMarkdown(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const m = lines[0].match(/# (.+?) 第([\d\-]+)[章单元].*?——\s*(.+)/);
  if (!m) { console.warn(`Skip: ${path.basename(filePath)}`); return null; }

  const rawName = m[1].trim();
  const chRange = m[2].trim(); // e.g. "3-4" or "6-10" or "1"
  const order = parseInt(chRange.split('-')[0]);
  const chNumber = chRange.includes('-') ? `第${chRange}章 ` : '';
  const chTitle = chNumber + stripMd(m[3].trim());

  let subKey: string | undefined;
  if (rawName.includes('研究方法')) subKey = '研究方法';
  else if (rawName.includes('教学系统设计')) subKey = '教学系统设计';
  else if (rawName.includes('教育技术学')) subKey = '教育技术学';
  const sub = SUBJECTS[subKey || ''] || { id: 'unknown', name: rawName, icon: '📚' };

  const chId = `${sub.id}-ch${order}`;
  const kps = extractKnowledgePoints(chId, lines);
  tagKnowledgePoints(kps);
  const eps = extractErrorProne(lines);
  const wps = extractWeakPoints(lines);

  console.log(`  ✓ ${chId}: ${chTitle} (${kps.length}KPs ${eps.length}EPs ${wps.length}WPs)`);
  const sourceRef = SOURCE_REF_MAP[sub.id]?.[order];
  return { id: chId, subjectId: sub.id, order, title: chTitle, importance: parseImportance(lines[0]), frameworkTree: extractFrameworkTree(lines), knowledgePoints: kps, errorProne: eps, weakPoints: wps, sourceRef };
}

// ── Flashcard generation ──

function hasTable(c: string) { const ls = c.split('\n'); return ls.some(l => /^\|.+\|$/.test(l)) && ls.some(l => /^\|[\s\-:|]+\|$/.test(l)); }
function hasList(c: string) { return c.split('\n').filter(l => /^[①②③④⑤⑥⑦⑧⑨⑩\d]+[.、)\s]/.test(l)).length >= 2; }
function listItems(c: string) { return c.split('\n').filter(l => /^[①②③④⑤⑥⑦⑧⑨⑩\d]+[.、)\s]/.test(l)).map(stripMd); }

function genQ(kp: any): string {
  // Strip leading numbers, ★, and whitespace from title
  const t = kp.title
    .replace(/^[\d一二三四五六七八九十.、\s]+/, '')
    .replace(/★/g, '')
    .trim();
  switch (kp.category) {
    case 'definition': return `什么是${t}？`;
    case 'comparison': return hasTable(kp.content) ? `对比${t}的各个维度` : `${t}的核心区别是什么？`;
    case 'theory': return hasList(kp.content) ? `列出${t}的要点` : `${t}的核心内容是什么？`;
    case 'method': return hasList(kp.content) ? `${t}包括哪些？` : `${t}是什么？`;
    default: return `简述${t}`;
  }
}

function cleanTable(md: string): string {
  // Remove rows where first cell is empty (merged-cell continuation rows)
  const lines = md.split('\n');
  const clean = lines.filter(l => {
    const cells = l.split('|').map(c => c.trim());
    // Keep header, separator, and rows with non-empty first data cell
    if (/^\|[\s\-:|]+\|$/.test(l)) return true; // separator row
    if (/^\|.+\|$/.test(l) && cells.length >= 2 && !cells[1]) return false; // empty first cell
    return true;
  });
  return stripMd(clean.join('\n'));
}

function genA(kp: any): string {
  const c = kp.content.trim();
  if (hasTable(c)) return cleanTable(c);
  if (hasList(c)) return listItems(c).join('\n');
  const ls = c.split('\n').filter(l => l.trim());
  return stripMd(ls.length <= 6 ? c : ls.slice(0, 5).join('\n'));
}

// ── Main ──

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} MD files\n`);

  const chapters: any[] = [];
  const skipped: string[] = [];
  for (const f of files) {
    try {
      const result = parseMarkdown(path.join(CARDS_DIR, f));
      if (result) chapters.push(result);
      else skipped.push(`${f}: 标题格式不匹配`);
    } catch (err: any) {
      skipped.push(`${f}: ${err.message}`);
      console.warn(`  ✗ ERROR: ${f} - ${err.message}`);
    }
  }

  const subjects = Object.values(SUBJECTS).map(s => ({
    ...s,
    chapters: chapters.filter((c: any) => c.subjectId === s.id).sort((a: any, b: any) => a.order - b.order),
  })).filter((s: any) => s.chapters.length > 0);

  // Flashcard generation
  const flashcards: any[] = [];
  for (const ch of chapters) {
    for (const kp of ch.knowledgePoints) {
      // Generate from any KP with content, boost importance from chapter if needed
      const effImportance = kp.importance > 0 ? kp.importance : ch.importance;
      if (kp.content.length > 10) {
        flashcards.push({ id: `${ch.id}-fc-kp${flashcards.length + 1}`, chapterId: ch.id, question: genQ(kp), answer: genA(kp), importance: effImportance });
      }
    }
    for (const ep of ch.errorProne) {
      const parts = ep.split(/[：:]/);
      if (parts.length >= 2) flashcards.push({ id: `${ch.id}-fc-ep${flashcards.length + 1}`, chapterId: ch.id, question: '⚠️ ' + parts[0].trim(), answer: parts.slice(1).join('：').trim(), importance: 4 });
    }
  }

  // Search index
  const searchIndex: any[] = [];
  for (const s of subjects) {
    for (const ch of (s as any).chapters) {
      searchIndex.push({ id: ch.id, type: 'chapter', title: `${s.name} · ${ch.title}`, content: ch.title, subjectId: s.id, chapterId: ch.id, importance: ch.importance, tags: [] });
      for (const kp of ch.knowledgePoints) {
        searchIndex.push({ id: kp.id, type: 'knowledge-point', title: kp.title, content: kp.content.replace(/[#*|`\-\[\]\(\)>]/g, ' ').substring(0, 200), subjectId: s.id, chapterId: ch.id, importance: kp.importance, tags: kp.tags || [] });
      }
      for (const wp of ch.weakPoints) {
        searchIndex.push({ id: `${ch.id}-wp${searchIndex.length}`, type: 'weak-point', title: wp, content: wp, subjectId: s.id, chapterId: ch.id, importance: 3, tags: [] });
      }
    }
  }

  // Atomic write: tmp → rename (never corrupt the file)
  const result = { subjects, flashcards, searchIndex };
  const tmp = OUTPUT + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(result, null, 2), 'utf-8');
  // Validate by reading back
  try { JSON.parse(fs.readFileSync(tmp, 'utf-8')); } catch { console.error('FATAL: output JSON validation failed'); process.exit(1); }
  fs.renameSync(tmp, OUTPUT);

  console.log(`\n✅ ${subjects.length} subjects · ${chapters.length} chapters · ${flashcards.length} flashcards · ${searchIndex.length} search entries`);
  if (skipped.length > 0) {
    console.log(`\n⚠️  ${skipped.length} file(s) skipped:`);
    skipped.forEach(s => console.log(`   - ${s}`));
  }
}

main();
