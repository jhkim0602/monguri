// 뭐 여기도 개좆같은 mock 데이터 이긴 한데
// 카테고리를 굳이 굳이 DB에 올리기도 뭐해서 ㅇㅇ


export type ColumnSeries = {
  id: string;
  title: string;
  description: string;
  themeClass: string;
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