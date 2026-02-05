export type ColumnSeries = {
  id: string;
  title: string;
  description: string;
  themeClass: string;
};

export type ColumnArticle = {
  slug: string;
  seriesId: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  coverImage: string;
  excerpt: string;
  status: "published" | "coming_soon";
};

export const COLUMN_SERIES: ColumnSeries[] = [
  {
    id: "habit",
    title: "생활 습관&동기부여",
    description: "공부 루틴을 만드는 작고 확실한 습관",
    themeClass: "bg-amber-50 text-amber-700",
  },
  {
    id: "study",
    title: "서울대쌤들의 국영수 공부법",
    description: "과목별 최적 루틴과 실전 노하우",
    themeClass: "bg-blue-50 text-blue-700",
  },
];

export const COLUMN_ARTICLES: ColumnArticle[] = [
  {
    slug: "ten-minutes-habit",
    seriesId: "habit",
    title: "짧은 시간의 힘, 자투리 10분이 성적을 바꾼다",
    subtitle: "쉬는 시간 10분 복습이 하루를 바꾼다",
    author: "윤서영 · 서울대학교",
    date: "2026.02.05",
    coverImage:
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?w=1200&q=80",
    excerpt:
      "자투리 시간의 10분이 수업 후 30분보다 강력해지는 순간. 꾸준함을 만드는 작은 루틴을 소개합니다.",
    status: "published",
  },
  {
    slug: "dont-give-up",
    seriesId: "habit",
    title: "공부가 하기 싫은 날, 그래도 포기하지 않는 법",
    subtitle: "작게 시작해서 흐름을 이어가는 방법",
    author: "김도윤 · 서울대학교",
    date: "2026.02.05",
    coverImage:
      "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=1200&q=80",
    excerpt:
      "컨디션이 바닥인 날에도 공부 흐름을 잃지 않는 실전 루틴을 정리했습니다.",
    status: "published",
  },
  {
    slug: "productive-now-1",
    seriesId: "habit",
    title: "지금 당장 생산적인 공부를 하는 법 (1)",
    subtitle: "5분 계획 + 25분 집중 + 5분 점검",
    author: "이민지 · 서울대학교",
    date: "2026.02.05",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
    excerpt:
      "의지만으로 버티지 말고 구조로 승부하자. 짧고 단단한 집중법.",
    status: "published",
  },
  {
    slug: "my-curriculum",
    seriesId: "habit",
    title: "'나만의 공부 커리큘럼'을 만들자",
    subtitle: "중간 목표가 있는 공부는 흔들리지 않는다",
    author: "박서진 · 서울대학교",
    date: "2026.02.05",
    coverImage:
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=80",
    excerpt:
      "내 공부를 설계하는 순간, 공부는 의지가 아니라 시스템이 됩니다.",
    status: "published",
  },
  {
    slug: "english-grade-strategy",
    seriesId: "study",
    title: "영어 내신 공부법: 상위권이 되는 현실적인 방법",
    subtitle: "지문을 외우지 말고 패턴으로 잡아라",
    author: "서울대 영어 멘토",
    date: "2026.02.05",
    coverImage:
      "https://images.unsplash.com/photo-1456428199391-a3b1cb5e93ab?w=1200&q=80",
    excerpt:
      "내신 영어는 범위를 좁히고 정확도를 높이는 싸움입니다.",
    status: "published",
  },
  {
    slug: "korean-grade-strategy",
    seriesId: "study",
    title: "국어 내신 공부법: 과목별로 달라지는 전략",
    subtitle: "문학/비문학/문법을 다르게 접근하기",
    author: "서울대 국어 멘토",
    date: "2026.02.05",
    coverImage:
      "https://images.unsplash.com/photo-1491841651911-c44c30c34548?w=1200&q=80",
    excerpt:
      "국어는 한 과목처럼 보이지만, 실제로는 세 과목입니다.",
    status: "published",
  },
  {
    slug: "math-error-notes",
    seriesId: "study",
    title: "내신·수능 공통 수학 공부법: 오답노트 작성법",
    subtitle: "틀린 이유를 한 줄로 끝내지 않는다",
    author: "서울대 수학 멘토",
    date: "2026.02.05",
    coverImage:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80",
    excerpt:
      "오답노트는 문제를 모으는 노트가 아니라 사고를 바꾸는 노트입니다.",
    status: "published",
  },
  {
    slug: "suneung-korean-reading",
    seriesId: "study",
    title: "수능 국어 공부법: '읽어야할 것을 읽는 것'이 전부입니다.",
    subtitle: "독해는 속도가 아니라 방향이다",
    author: "서울대 국어 멘토",
    date: "2026.02.05",
    coverImage:
      "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1200&q=80",
    excerpt:
      "모든 정보를 읽으려 하지 마세요. 읽어야 할 것만 읽는 훈련이 핵심입니다.",
    status: "published",
  },
];
