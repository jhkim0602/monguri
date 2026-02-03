
export const USER_PROFILE = {
  name: "김서연",
  role: "고3 수험생",
  dDay: 230,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
};

export const DEFAULT_CATEGORIES = [
  { id: "korean", name: "국어", color: "bg-red-200", textColor: "text-red-700" },
  { id: "english", name: "영어", color: "bg-blue-200", textColor: "text-blue-700" },
  { id: "math", name: "수학", color: "bg-green-200", textColor: "text-green-700" },
  { id: "explore", name: "탐구", color: "bg-purple-200", textColor: "text-purple-700" },
];

export const MENTOR_TASKS = [
  {
    id: 1,
    subject: "수학",
    title: "미적분 킬러문항 3개년 기출 분석",
    status: "pending",
    badgeColor: "bg-green-100 text-green-700",
    description: "2022~2024학년도 수능 미적분 30번 문제 풀이 및 오답노트 작성. 공통 패턴 정리 필수.",
    categoryId: "math",
    mentorFeedback: "아직 피드백이 등록되지 않았습니다.",
    deadline: new Date(2026, 1, 2), // Feb 2, 2026
    attachments: [
      { name: "미적분_킬러_패턴분석.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" }
    ],
    submissions: [],
    mentorComment: "",
    feedbackFiles: []
  },
  {
    id: 2,
    subject: "영어",
    title: "EBS 연계 지문 빈칸추론 20문항",
    status: "submitted",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "수능특강 영어독해 3과~5과 빈칸추론 유형 집중 학습. 근거 문장 표시하며 풀이.",
    categoryId: "english",
    mentorFeedback: "과제 제출 확인했습니다. 피드백 대기 중입니다.",
    deadline: new Date(2026, 1, 2), // Feb 2, 2026
    attachments: [
      { name: "영어_빈칸추론_모음집.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80" }
    ],
    submissions: [
      { name: "영어과제_제출_서연.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" },
      { name: "문제풀이_사진.jpg", type: "image", url: "#", previewUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80" }
    ],
    mentorComment: "",
    feedbackFiles: []
  },
  {
    id: 3,
    subject: "국어",
    title: "국어 문학 3지문",
    status: "feedback_completed",
    badgeColor: "bg-red-100 text-red-700",
    description: "EBS 연계 문학 작품 3지문 분석 및 문제 풀이",
    categoryId: "korean",
    mentorFeedback: "시어 분석이 매우 정확합니다! 특히 현대시의 상징적 의미 파악 능력이 크게 향상되었네요.",
    deadline: new Date(2026, 0, 29), // Jan 29, 2026
    attachments: [
      { name: "문학3지문_분석자료.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80" }
    ],
    submissions: [
      { name: "국어숙제_제출.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80" }
    ],
    mentorComment: "시어 분석이 매우 정확합니다! 특히 현대시의 상징적 의미 파악 능력이 크게 향상되었네요. 다음엔 시상 전개 방식도 함께 정리해보세요.",
    feedbackFiles: []
  }
];
