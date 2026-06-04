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

// ── Utils ──

function stripMd(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function parseImportance(title: string): number {
  return Math.min((title.match(/★/g) || []).length, 5);
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
  let tree = '', inBlock = false;
  for (const l of lines) {
    if (l.includes('本章框架') || l.includes('本章结构')) { inBlock = true; continue; }
    if (inBlock && l.trim().startsWith('```')) break;
    if (inBlock && l.trim().startsWith('```')) { inBlock = false; continue; }
    if (inBlock) tree += l + '\n';
  }
  return tree.trim();
}

function extractKnowledgePoints(chapterId: string, lines: string[]) {
  const kps: { id: string; title: string; content: string[]; importance: number; category: string; color: string; tags: string[] }[] = [];
  let cur: { title: string; content: string[]; importance: number } | null = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    const isSpecial = line.includes('本章框架') || line.includes('常见易错点') || line.includes('我的薄弱点');

    if ((h2 || h3) && !isSpecial) {
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
    } else if (cur && line.trim() && !line.startsWith('##')) {
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
  const order = parseInt(m[2].split('-')[0]);
  const chTitle = stripMd(m[3].trim());

  let subKey: string | undefined;
  if (rawName.includes('研究方法')) subKey = '研究方法';
  else if (rawName.includes('教学系统设计')) subKey = '教学系统设计';
  else if (rawName.includes('教育技术学')) subKey = '教育技术学';
  const sub = SUBJECTS[subKey || ''] || { id: 'unknown', name: rawName, icon: '📚' };

  const chId = `${sub.id}-ch${order}`;
  const kps = extractKnowledgePoints(chId, lines);
  const eps = extractErrorProne(lines);
  const wps = extractWeakPoints(lines);

  console.log(`  ✓ ${chId}: ${chTitle} (${kps.length}KPs ${eps.length}EPs ${wps.length}WPs)`);
  return { id: chId, subjectId: sub.id, order, title: chTitle, importance: parseImportance(lines[0]), frameworkTree: extractFrameworkTree(lines), knowledgePoints: kps, errorProne: eps, weakPoints: wps };
}

// ── Flashcard generation ──

function hasTable(c: string) { const ls = c.split('\n'); return ls.some(l => /^\|.+\|$/.test(l)) && ls.some(l => /^\|[\s\-:|]+\|$/.test(l)); }
function hasList(c: string) { return c.split('\n').filter(l => /^[①②③④⑤⑥⑦⑧⑨⑩\d]+[.、)\s]/.test(l)).length >= 2; }
function listItems(c: string) { return c.split('\n').filter(l => /^[①②③④⑤⑥⑦⑧⑨⑩\d]+[.、)\s]/.test(l)).map(stripMd); }

function genQ(kp: any): string {
  // Strip leading numbers, ★, and whitespace from title
  const t = kp.title
    .replace(/^[一二三四五六七八九十\d]+[.、]\s*/, '')
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

function genA(kp: any): string {
  const c = kp.content.trim();
  if (hasTable(c)) return c;
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
