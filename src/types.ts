// 科目
export interface Subject {
  id: string;
  name: string;
  icon: string;
  chapters: Chapter[];
}

// 章节
export interface Chapter {
  id: string;
  subjectId: string;
  order: number;
  title: string;
  importance: number;
  frameworkTree: string;
  knowledgePoints: KnowledgePoint[];
  errorProne: string[];
  weakPoints: string[];
  sourceRef?: string;
}

// 知识点
export interface KnowledgePoint {
  id: string;
  title: string;
  content: string;
  importance: number;
  category: 'definition' | 'comparison' | 'theory' | 'method';
  color: 'red' | 'blue' | 'green' | 'yellow';
  tags: string[];
}

// 闪卡
export interface FlashCard {
  id: string;
  chapterId: string;
  question: string;
  answer: string;
  importance: number;
}

// 搜索索引条目
export interface SearchEntry {
  id: string;
  type: 'chapter' | 'knowledge-point' | 'flashcard' | 'weak-point';
  title: string;
  content: string;
  subjectId: string;
  chapterId: string;
  importance: number;
  tags: string[];
}

// 全书数据
export interface KnowledgeBase {
  subjects: Subject[];
  flashcards: FlashCard[];
  searchIndex: SearchEntry[];
}
