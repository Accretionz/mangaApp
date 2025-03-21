export interface MangaResult {
  title: string;
  link: string;
  author: string;
  summary: string;
}

export interface ChapterResult {
  chapterNumber: string;
  chapterLink: string;
  chapterTitle: string;
  chapterReadTime: string;
  orderNumber: string;
}

export interface ImageResult {
  src: string;
}