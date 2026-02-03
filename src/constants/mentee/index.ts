
export const SUBJECT_TIPS = [
  {
    id: 1,
    subject: "국어",
    title: "비문학 독해, 선지부터 읽어야 하는 이유",
    desc: "시간 단축과 정확도를 동시에 잡는 독해 전략",
    color: "bg-red-100 text-red-600",
  },
  {
    id: 2,
    subject: "수학",
    title: "킬러문항 접근법: 조건 해석이 80%",
    desc: "고난도 문제를 푸는 체계적 사고 프로세스",
    color: "bg-green-100 text-green-600",
  },
  {
    id: 3,
    subject: "영어",
    title: "빈칸추론, 앞뒤 문장만 봐도 답 나온다",
    desc: "논리 흐름 파악으로 정답률 90% 달성하기",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 4,
    subject: "수학",
    title: "기하 벡터 문제 5분 컷 비법",
    desc: "내적과 외적 활용 패턴 완벽 정리",
    color: "bg-green-100 text-green-600",
  },
];

export const MENTOR_MESSAGES = {
  today: "성공은 매일 반복되는 작은 노력들의 합이다. - 로버트 콜리어",
  consultation: "오늘 19:00에 멘토링 상담이 예정되어 있습니다.",
  plannerComment: "오늘 하루 학습 내용과 느낀 점을 간단히 기록해주세요",
};

export const SCHEDULE_HOURS = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 6;
  return hour < 10 ? `0${hour}` : `${hour}`;
});

// Weekly schedule with learning plans
export const WEEKLY_SCHEDULE = [
  {
    date: new Date(2026, 1, 2), // Feb 2, 2026
    events: [
      { id: 201, title: "국어 비문학 3지문", categoryId: "korean" },
      { id: 202, title: "수학 수1 등차수열", categoryId: "math" },
    ],
  },
  {
    date: new Date(2026, 1, 3), // Feb 3, 2026
    events: [
      { id: 203, title: "문법 강의 1강", categoryId: "korean" },
      { id: 204, title: "영어 빈칸추론 5문제", categoryId: "english" },
    ],
  },
  {
    date: new Date(2026, 0, 31), // Jan 31, 2026
    events: [
      { id: 205, title: "수학 나형 기출", categoryId: "math" },
      { id: 206, title: "국어 독서 풀이", categoryId: "korean" },
    ],
  },
  {
    date: new Date(2026, 0, 29), // Jan 29, 2026
    events: [
      { id: 207, title: "영어 단어 50개", categoryId: "english" },
      { id: 208, title: "국어 현대시 복습", categoryId: "korean" },
    ],
  }
];

// Mock Data for Calendar Heatmap & Mood
export const DAILY_RECORDS = [
  { date: new Date(2026, 0, 28), studyTime: 120, mood: "good" },
  { date: new Date(2026, 0, 29), studyTime: 240, mood: "best" },
  { date: new Date(2026, 0, 30), studyTime: 45, mood: "bad" },
  { date: new Date(2026, 0, 31), studyTime: 180, mood: "normal" },
  { date: new Date(2026, 1, 1), studyTime: 320, mood: "best" },
  { date: new Date(2026, 1, 2), studyTime: 0, mood: "worst" },
  { date: new Date(2026, 1, 3), studyTime: 150, mood: "good" },
];

export const MOOD_EMOJIS: { [key: string]: string } = {
  best: "🤩",
  good: "😊",
  normal: "😐",
  bad: "😞",
  worst: "😫"
};
