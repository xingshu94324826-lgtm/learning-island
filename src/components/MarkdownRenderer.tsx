import React from 'react';
import { Table, CodeBlock, Divider } from 'animal-island-ui';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Parse markdown table lines into columns + dataSource for animal-island-ui Table
 */
function parseTable(lines: string[]): { columns: { title: string; dataIndex: string }[]; data: Record<string, string>[] } | null {
  if (lines.length < 2) return null;

  // First line = header, second = separator
  const headerMatch = lines[0].match(/^\|(.+)\|$/);
  const sepMatch = lines[1].match(/^\|[\s\-:|]+\|$/);
  if (!headerMatch || !sepMatch) return null;

  const allCells = headerMatch[1].split('|').map(h => h.trim());
  // First cell may be empty (row-header column) — keep it so column count matches data cells
  if (allCells.every(c => !c)) return null;

  const columns = allCells.map((h, i) => ({
    title: stripMarkdown(h),
    dataIndex: `col${i}`,
    render: (value: unknown) => (
      <span dangerouslySetInnerHTML={{ __html: cleanInline(String(value || '')) }} />
    ),
  }));

  const data: Record<string, string>[] = [];
  for (let i = 2; i < lines.length; i++) {
    const rowMatch = lines[i].match(/^\|(.+)\|$/);
    if (!rowMatch) break;
    const cells = rowMatch[1].split('|').map(c => c.trim());
    const row: Record<string, string> = {};
    columns.forEach((col, j) => {
      row[col.dataIndex] = cells[j] || '';
    });
    data.push(row);
  }

  return { columns, data };
}

/**
 * Strip markdown to plain text — for table cells which can't render HTML
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

/**
 * Clean inline markdown: **bold**, *italic*, `code`
 * Returns HTML string for use in dangerouslySetInnerHTML
 */
function cleanInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

/**
 * Split markdown content into blocks: tables, code blocks, paragraphs, quotes
 */
function tokenize(content: string) {
  const lines = content.split('\n');
  const blocks: { type: 'text' | 'table' | 'code' | 'quote'; lines: string[] }[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block: starts with ```
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++; // skip opening ```
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      if (codeLines.length > 0) {
        blocks.push({ type: 'code', lines: codeLines });
      }
      continue;
    }

    // Table: starts with |...|, followed by |---|---|
    if (line.match(/^\|.+\|$/) && i + 1 < lines.length && lines[i + 1].match(/^\|[\s\-:|]+\|$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].match(/^\|.+\|$/)) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', lines: tableLines });
      continue;
    }

    // Blockquote: starts with >
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i].trim() === '>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', lines: quoteLines });
      continue;
    }

    // Regular text paragraph — collect until blank line or special char
    if (line.trim()) {
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() &&
             !lines[i].trim().startsWith('```') &&
             !lines[i].match(/^\|.+\|$/) &&
             !lines[i].startsWith('> ')) {
        textLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'text', lines: textLines });
    } else {
      i++;
    }
  }

  return blocks;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const blocks = tokenize(content);

  if (blocks.length === 0) return null;

  return (
    <div>
      {blocks.map((block, bi) => {
        switch (block.type) {
          case 'table': {
            const tableData = parseTable(block.lines);
            if (!tableData) {
              // Fallback: render as pre text
              return (
                <pre key={bi} style={{
                  fontSize: 11, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', margin: '8px 0',
                  fontFamily: '"Cascadia Code", "Fira Code", monospace',
                  background: 'rgba(0,0,0,.02)', padding: '8px 12px', borderRadius: 10,
                }}>
                  {block.lines.join('\n')}
                </pre>
              );
            }
            return (
              <div key={bi} style={{ margin: '10px 0', overflowX: 'auto' }}>
                <Table
                  columns={tableData.columns}
                  dataSource={tableData.data}
                  striped
                />
              </div>
            );
          }

          case 'code':
            return (
              <div key={bi} style={{ margin: '8px 0' }}>
                <CodeBlock code={block.lines.join('\n')} />
              </div>
            );

          case 'quote':
            return (
              <div key={bi} style={{
                borderLeft: '3px solid var(--animal-primary-color, #19c8b9)',
                padding: '8px 14px',
                margin: '10px 0',
                background: 'rgba(25,200,185,.06)',
                borderRadius: '0 12px 12px 0',
                fontSize: 13,
                lineHeight: 1.7,
              }}>
                {block.lines.map((l, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: cleanInline(l) || '&nbsp;' }} />
                ))}
              </div>
            );

          case 'text':
          default:
            return (
              <div key={bi} style={{
                fontSize: 13, lineHeight: 1.8,
                whiteSpace: 'pre-wrap', margin: '6px 0',
              }}>
                {block.lines.map((l, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: cleanInline(l) || '&nbsp;' }} />
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}
