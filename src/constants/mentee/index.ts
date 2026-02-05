// 📚 멘토가 설정한 과제들 (deadline 기준으로 정리)
export const MENTOR_TASKS = [
  {
    // 📚 멘토 과제 1: 피드백 완료 (1/29)
    id: 1,
    subject: "국어",
    title: "국어 문학 현대시 3지문 분석",
    status: "feedback_completed",
    badgeColor: "bg-green-100 text-green-700",
    description:
      "EBS 연계 현대시 작품 3지문 분석 및 문제 풀이. 시어의 상징적 의미와 시상 전개 방식 파악.",
    categoryId: "korean",
    mentorFeedback:
      "시어 분석이 매우 정확합니다! 특히 현대시의 상징적 의미 파악 능력이 크게 향상되었네요.",
    deadline: new Date(2026, 0, 29),
    attachments: [
      {
        name: "문학3지문_분석자료.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
      },
    ],
    submissions: [
      {
        name: "국어숙제_제출.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80",
      },
    ],
    mentorComment:
      "시어 분석이 매우 정확합니다! 특히 현대시의 상징적 의미 파악 능력이 크게 향상되었네요. 다음엔 시상 전개 방식도 함께 정리해보세요.",
    feedbackFiles: [],
    isMentorTask: true,
    completed: true,
    studyRecord: { photo: "제출함", note: "현대시 분석 완료" },
    hasMentorResponse: true,
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    // 📚 멘토 과제 2: 제출 완료, 피드백 대기 (1/30)
    id: 2,
    subject: "영어",
    title: "영어 순서배열 15문항",
    status: "submitted",
    badgeColor: "bg-pink-100 text-pink-700",
    description: "연결어와 지시어 찾기 연습. 논리적 흐름 파악이 핵심.",
    categoryId: "english",
    mentorFeedback: "제출 확인했습니다. 꼼꼼히 풀었네요!",
    deadline: new Date(2026, 0, 30),
    attachments: [
      {
        name: "순서배열_문제.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
      },
    ],
    submissions: [
      {
        name: "순서배열_제출.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80",
      },
    ],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    studyRecord: { photo: "제출함", note: "연결어 찾기 연습" },
    hasMentorResponse: false,
    startTime: "10:30",
    endTime: "11:30",
  },
  {
    // 📚 멘토 과제 3: 제출 완료, 피드백 대기 (2/1)
    id: 3,
    subject: "수학",
    title: "수학 기하 벡터 10문항",
    status: "submitted",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "평면벡터와 공간벡터 개념 정리 및 내적 활용 문제",
    categoryId: "math",
    mentorFeedback: "과제 제출 확인했습니다. 피드백 작성 중입니다.",
    deadline: new Date(2026, 1, 1),
    attachments: [
      {
        name: "기하벡터_문제.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
      },
    ],
    submissions: [
      {
        name: "기하_풀이_제출.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
      },
    ],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    studyRecord: { photo: "제출함", note: "벡터 내적 개념 복습" },
    hasMentorResponse: false,
    startTime: "14:00",
    endTime: "15:00",
  },
  {
    // 📚 멘토 과제 4: 오늘 마감 - 제출 완료 (2/2)
    id: 4,
    subject: "영어",
    title: "EBS 연계 지문 빈칸추론 20문항",
    status: "submitted",
    badgeColor: "bg-pink-100 text-pink-700",
    description:
      "수능특강 영어독해 3과~5과 빈칸추론 유형 집중 학습. 근거 문장 표시하며 풀이.",
    categoryId: "english",
    mentorFeedback: "과제 제출 확인했습니다. 피드백 대기 중입니다.",
    deadline: new Date(2026, 1, 2),
    attachments: [
      {
        name: "영어_빈칸추론_모음집.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
      },
    ],
    submissions: [
      {
        name: "영어과제_제출_서연.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
      },
      {
        name: "문제풀이_사진.jpg",
        type: "image",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80",
      },
    ],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    studyRecord: { photo: "제출함", note: "빈칸 근거 찾기 연습" },
    hasMentorResponse: false,
    startTime: "16:00",
    endTime: "17:00",
  },
  {
    // 📚 멘토 과제 5: 오늘 마감 - 아직 미제출 (2/2)
    id: 5,
    subject: "수학",
    title: "미적분 킬러문항 3개년 기출 분석",
    status: "pending",
    badgeColor: "bg-blue-100 text-blue-700",
    description:
      "2022~2024학년도 수능 미적분 30번 문제 풀이 및 오답노트 작성. 공통 패턴 정리 필수.",
    categoryId: "math",
    mentorFeedback: "아직 피드백이 등록되지 않았습니다.",
    deadline: new Date(2026, 1, 2),
    attachments: [
      {
        name: "미적분_킬러_패턴분석.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
      },
    ],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    completed: false,
    studyRecord: null,
    hasMentorResponse: false,
  },
  {
    // 📚 멘토 과제 6: 내일 마감 (2/3)
    id: 6,
    subject: "수학",
    title: "수학1 삼각함수 그래프 20문항",
    status: "pending",
    badgeColor: "bg-blue-100 text-blue-700",
    description:
      "삼각함수 주기와 대칭성 활용 문제 집중 공략. 그래프 변환 연습 필수.",
    categoryId: "math",
    mentorFeedback: "아직 피드백이 등록되지 않았습니다.",
    deadline: new Date(2026, 1, 3),
    attachments: [
      {
        name: "삼각함수_그래프.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
      },
    ],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    completed: false,
    studyRecord: null,
    hasMentorResponse: false,
  },
  {
    // 📚 멘토 과제 7: 2/4 마감
    id: 7,
    subject: "국어",
    title: "언어와 매체 개념 정리",
    status: "pending",
    badgeColor: "bg-green-100 text-green-700",
    description:
      "음운의 변동 파트 백지 복습. 비음화, 유음화, 된소리되기 등 주요 음운 변동 정리.",
    categoryId: "korean",
    mentorFeedback: "아직 피드백이 등록되지 않았습니다.",
    deadline: new Date(2026, 1, 4),
    attachments: [
      {
        name: "언어와매체_개념.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
      },
    ],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    completed: false,
    studyRecord: null,
    hasMentorResponse: false,
  },
  {
    // 📚 멘토 과제 8: 2/4 마감 - 피드백 완료 (성취 리포트 확인용)
    id: 8,
    subject: "수학",
    title: "미적분 실전 모의 1회",
    status: "feedback_completed",
    badgeColor: "bg-blue-100 text-blue-700",
    description:
      "실전 모의 1회분 풀이 및 오답 원인 분석. 시간 배분을 체크하면서 풀이.",
    categoryId: "math",
    mentorFeedback:
      "시간 배분이 좋아졌고, 21번 실수가 줄었어요. 30번은 풀이 전 조건 정리부터 하세요.",
    deadline: new Date(2026, 1, 4),
    attachments: [
      {
        name: "모의_1회_문제.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
      },
    ],
    submissions: [
      {
        name: "모의1회_제출.pdf",
        type: "pdf",
        url: "#",
        previewUrl:
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
      },
    ],
    mentorComment:
      "풀이 과정이 안정적이야. 실전에서 시간 체크하면서 그대로 유지해보자.",
    feedbackFiles: [],
    isMentorTask: true,
    completed: true,
    studyRecord: { photo: "제출함", note: "모의고사 1회 제출 완료" },
    hasMentorResponse: true,
    startTime: "18:00",
    endTime: "19:30",
  },
];

// ✏️ 멘티가 직접 설정한 과제들 (자율 학습)
export const USER_TASKS = [
  {
    // ✏️ 멘티 과제 1: 완료, 질문 & 멘토 응답 있음 (1/29)
    id: "u1",
    title: "수학 수1 등차수열 복습",
    categoryId: "math",
    description: "스스로 선택한 학습 과제",
    status: "submitted",
    badgeColor: "bg-blue-100 text-blue-700",
    deadline: new Date(2026, 0, 29),
    completed: true,
    timeSpent: 3600,
    isRunning: false,
    isMentorTask: false,
    studyRecord: { photo: "제출함", note: "등차수열 합 공식 정리" },
    userQuestion:
      "선생님, 등차수열의 합 공식에서 n(n+1)/2가 왜 나오는지 이해가 안 가요",
    hasMentorResponse: true,
    mentorComment:
      "좋은 질문이네! 등차수열의 합은 첫 항과 마지막 항의 평균에 항의 개수를 곱한 것이야. Σk = n(n+1)/2는 1부터 n까지의 합이므로, 이를 증명하려면 가우스의 방법을 사용하면 돼. 1+2+...+n과 n+(n-1)+...+1을 더하면 모두 (n+1)이 n개 나오니까 n(n+1)/2가 되는 거야.",
    attachments: [],
    submissions: [],
    feedbackFiles: [],
    startTime: "11:30",
    endTime: "12:30",
  },
  {
    // ✏️ 멘티 과제 2: 완료, 질문 없음 (2/2)
    id: "u2",
    title: "영어 단어 50개 암기",
    categoryId: "english",
    description: "스스로 선택한 학습 과제",
    status: "submitted",
    badgeColor: "bg-pink-100 text-pink-700",
    deadline: new Date(2026, 1, 2),
    completed: true,
    timeSpent: 1800,
    isRunning: false,
    isMentorTask: false,
    studyRecord: {
      photos: [
        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400",
      ],
      note: "오늘 외운 단어들입니다. 어려운 단어 위주로 정리했어요.",
    },
    userQuestion: undefined,
    hasMentorResponse: false,
    attachments: [],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
  },
  {
    // ✏️ 멘티 과제 3: 완료 (1/31)
    id: "u3",
    title: "국어 독서 비문학 2지문",
    categoryId: "korean",
    description: "스스로 선택한 학습 과제",
    status: "submitted",
    badgeColor: "bg-green-100 text-green-700",
    deadline: new Date(2026, 0, 31),
    completed: true,
    timeSpent: 2400,
    isRunning: false,
    isMentorTask: false,
    studyRecord: { photo: "제출함", note: "과학 지문이 어려웠음" },
    userQuestion: undefined,
    hasMentorResponse: false,
    attachments: [],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
  },
  {
    // ✏️ 멘티 과제 4: 완료 (2/1)
    id: "u4",
    title: "수학 기출 오답노트 정리",
    categoryId: "math",
    description: "스스로 선택한 학습 과제",
    status: "submitted",
    badgeColor: "bg-blue-100 text-blue-700",
    deadline: new Date(2026, 1, 1),
    completed: true,
    timeSpent: 2700,
    isRunning: false,
    isMentorTask: false,
    studyRecord: { photo: "제출함", note: "기출 오답 5문제 정리" },
    userQuestion: undefined,
    hasMentorResponse: false,
    attachments: [],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
  },
  {
    // ✏️ 멘티 과제 5: 오늘 진행 중 (2/2)
    id: "u5",
    title: "국어 비문학 독해 3지문",
    categoryId: "korean",
    description: "스스로 선택한 학습 과제",
    status: "pending",
    badgeColor: "bg-green-100 text-green-700",
    deadline: new Date(2026, 1, 2),
    completed: false,
    timeSpent: 0,
    isRunning: false,
    isMentorTask: false,
    studyRecord: null,
    userQuestion: undefined,
    hasMentorResponse: false,
    attachments: [],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
    startTime: "13:00",
    endTime: "14:00",
  },
  {
    // ✏️ 멘티 과제 6: 오늘 진행 예정 (2/2)
    id: "u6",
    title: "영어 듣기 평가 10문항",
    categoryId: "english",
    description: "스스로 선택한 학습 과제",
    status: "pending",
    badgeColor: "bg-pink-100 text-pink-700",
    deadline: new Date(2026, 1, 2),
    completed: false,
    timeSpent: 0,
    isRunning: false,
    isMentorTask: false,
    studyRecord: null,
    userQuestion: undefined,
    hasMentorResponse: false,
    attachments: [],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
    startTime: "14:10",
    endTime: "15:00",
  },
];

export const SUBJECT_TIPS = [
  {
    id: 1,
    subject: "국어",
    title: "비문학 독해, 선지부터 읽어야 하는 이유",
    desc: "시간 단축과 정확도를 동시에 잡는 독해 전략",
    color: "bg-green-100 text-green-700",
  },
  {
    id: 2,
    subject: "수학",
    title: "킬러문항 접근법: 조건 해석이 80%",
    desc: "고난도 문제를 푸는 체계적 사고 프로세스",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    subject: "영어",
    title: "빈칸추론, 앞뒤 문장만 봐도 답 나온다",
    desc: "논리 흐름 파악으로 정답률 90% 달성하기",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: 4,
    subject: "수학",
    title: "기하 벡터 문제 5분 컷 비법",
    desc: "내적과 외적 활용 패턴 완벽 정리",
    color: "bg-blue-100 text-blue-700",
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

// 주간 학습 계획 (MENTOR_TASKS + USER_TASKS와 연동)
export const WEEKLY_SCHEDULE = [
  {
    date: new Date(2026, 0, 29), // Jan 29, 2026 (수요일)
    events: [
      {
        id: 1,
        title: "국어 문학 현대시 3지문 분석",
        categoryId: "korean",
        taskType: "mentor",
      }, // MENTOR_TASKS id:1
      {
        id: "u1",
        title: "수학 수1 등차수열 복습",
        categoryId: "math",
        taskType: "user",
      }, // USER_TASKS id:u1
      {
        id: 301,
        title: "영어 듣기 평가 연습",
        categoryId: "english",
        taskType: "plan",
      },
    ],
  },
  {
    date: new Date(2026, 0, 30), // Jan 30, 2026 (목요일)
    events: [
      {
        id: 2,
        title: "영어 순서배열 15문항",
        categoryId: "english",
        taskType: "mentor",
      }, // MENTOR_TASKS id:2
      {
        id: 302,
        title: "국어 현대시 복습",
        categoryId: "korean",
        taskType: "plan",
      },
    ],
  },
  {
    date: new Date(2026, 0, 31), // Jan 31, 2026 (금요일)
    events: [
      {
        id: "u3",
        title: "국어 독서 비문학 2지문",
        categoryId: "korean",
        taskType: "user",
      }, // USER_TASKS id:u3
      {
        id: 303,
        title: "수학 기출 풀이",
        categoryId: "math",
        taskType: "plan",
      },
    ],
  },
  {
    date: new Date(2026, 1, 1), // Feb 1, 2026 (토요일)
    events: [
      {
        id: 3,
        title: "수학 기하 벡터 10문항",
        categoryId: "math",
        taskType: "mentor",
      }, // MENTOR_TASKS id:3
      {
        id: "u4",
        title: "수학 기출 오답노트 정리",
        categoryId: "math",
        taskType: "user",
      }, // USER_TASKS id:u4
      {
        id: 304,
        title: "영단어 복습",
        categoryId: "english",
        taskType: "plan",
      },
    ],
  },
  {
    date: new Date(2026, 1, 2), // Feb 2, 2026 (일요일) ⭐ 오늘
    events: [
      {
        id: 4,
        title: "EBS 연계 지문 빈칸추론 20문항",
        categoryId: "english",
        taskType: "mentor",
      }, // MENTOR_TASKS id:4
      {
        id: 5,
        title: "미적분 킬러문항 3개년 기출 분석",
        categoryId: "math",
        taskType: "mentor",
      }, // MENTOR_TASKS id:5
      {
        id: "u5",
        title: "국어 비문학 독해 3지문",
        categoryId: "korean",
        taskType: "user",
      }, // USER_TASKS id:u5
      {
        id: "u6",
        title: "영어 듣기 평가 10문항",
        categoryId: "english",
        taskType: "user",
      }, // USER_TASKS id:u6
      {
        id: "u2",
        title: "영어 단어 50개 암기",
        categoryId: "english",
        taskType: "user",
      }, // USER_TASKS id:u2
    ],
  },
  {
    date: new Date(2026, 1, 3), // Feb 3, 2026 (월요일)
    events: [
      {
        id: 6,
        title: "수학1 삼각함수 그래프 20문항",
        categoryId: "math",
        taskType: "mentor",
      }, // MENTOR_TASKS id:6
      {
        id: 305,
        title: "국어 문법 강의 1강",
        categoryId: "korean",
        taskType: "plan",
      },
      {
        id: 306,
        title: "영어 빈칸추론 5문제",
        categoryId: "english",
        taskType: "plan",
      },
    ],
  },
  {
    date: new Date(2026, 1, 4), // Feb 4, 2026 (화요일)
    events: [
      {
        id: 7,
        title: "언어와 매체 개념 정리",
        categoryId: "korean",
        taskType: "mentor",
      }, // MENTOR_TASKS id:7
      {
        id: 8,
        title: "미적분 실전 모의 1회",
        categoryId: "math",
        taskType: "mentor",
      }, // MENTOR_TASKS id:8
      {
        id: 307,
        title: "수학 미분 챕터 복습",
        categoryId: "math",
        taskType: "plan",
      },
      {
        id: 308,
        title: "영어 독해 3지문",
        categoryId: "english",
        taskType: "plan",
      },
    ],
  },
  {
    date: new Date(2026, 1, 5), // Feb 5, 2026 (수요일)
    events: [
      { id: 309, title: "주간 모의고사", categoryId: "math", taskType: "plan" },
      {
        id: 310,
        title: "영어 단어 테스트",
        categoryId: "english",
        taskType: "plan",
      },
    ],
  },
];

// 일별 학습 기록 (학습 시간, 기분, 메모, 타임블록)
export const DAILY_RECORDS = [
  {
    date: new Date(2026, 0, 26),
    studyTime: 200,
    mood: "good",
    memo: "오늘은 컨디션이 좋았다. 수학 문제가 잘 풀림!",
    studyTimeBlocks: {
      "14:00": "math",
      "14:10": "math",
      "14:20": "math",
      "14:30": "math",
      "16:00": "english",
      "16:10": "english",
      "16:20": "english",
    },
  },
  {
    date: new Date(2026, 0, 27),
    studyTime: 150,
    mood: "normal",
    memo: "조금 피곤했지만 계획한 건 다 끝냈다.",
    studyTimeBlocks: {
      "15:00": "korean",
      "15:10": "korean",
      "15:20": "korean",
      "19:00": "math",
      "19:10": "math",
      "19:20": "math",
    },
  },
  {
    date: new Date(2026, 0, 28),
    studyTime: 120,
    mood: "good",
    memo: "국어 비문학이 계속 어렵다 ㅠㅠ",
    studyTimeBlocks: {
      "13:00": "korean",
      "13:10": "korean",
      "13:20": "korean",
      "13:30": "korean",
    },
  },
  {
    date: new Date(2026, 0, 29),
    studyTime: 240,
    mood: "best",
    memo: "국어 현대시 분석 완료! 수학 등차수열도 이해했다. 역대급 집중력!",
    studyTimeBlocks: {
      "09:00": "korean",
      "09:10": "korean",
      "09:20": "korean",
      "09:30": "korean",
      "14:00": "math",
      "14:10": "math",
      "14:20": "math",
      "14:30": "math",
      "19:00": "english",
      "19:10": "english",
      "19:20": "english",
      "19:30": "english",
    },
  },
  {
    date: new Date(2026, 0, 30),
    studyTime: 180,
    mood: "normal",
    memo: "영어 순서배열 제출하고 단어 50개 외웠다. 피곤하지만 만족스러움.",
    studyTimeBlocks: {
      "10:00": "english",
      "10:10": "english",
      "10:20": "english",
      "10:30": "english",
      "15:00": "english",
      "15:10": "english",
      "15:20": "english",
    },
  },
  {
    date: new Date(2026, 0, 31),
    studyTime: 165,
    mood: "normal",
    memo: "1월의 마지막 날. 국어 독서 2지문 풀이 완료. 내일도 화이팅!",
    studyTimeBlocks: {
      "13:00": "korean",
      "13:10": "korean",
      "13:20": "korean",
      "16:00": "korean",
      "16:10": "korean",
      "16:20": "korean",
      "16:30": "korean",
    },
  },
  {
    date: new Date(2026, 1, 1),
    studyTime: 280,
    mood: "best",
    memo: "2월 시작! 수학 기하 벡터 제출했다. 오답노트 정리도 끝!",
    studyTimeBlocks: {
      "09:00": "math",
      "09:10": "math",
      "09:20": "math",
      "09:30": "math",
      "09:40": "math",
      "14:00": "math",
      "14:10": "math",
      "14:20": "math",
      "14:30": "math",
      "20:00": "english",
      "20:10": "english",
      "20:20": "english",
    },
  },
  {
    date: new Date(2026, 1, 2),
    studyTime: 140,
    mood: "good",
    memo: "영어 빈칸추론 20문항 제출! 오늘도 열심히 했다.",
    studyTimeBlocks: {
      "09:00": "korean",
      "09:10": "korean",
      "09:20": "korean",
      "10:30": "english",
      "10:40": "english",
      "10:50": "english",
      "11:00": "english",
    },
  },
  {
    date: new Date(2026, 1, 3),
    studyTime: 0,
    mood: "normal",
    memo: "",
    studyTimeBlocks: {},
  },
  {
    date: new Date(2026, 1, 4),
    studyTime: 0,
    mood: "normal",
    memo: "",
    studyTimeBlocks: {},
  },
  {
    date: new Date(2026, 1, 5),
    studyTime: 0,
    mood: "normal",
    memo: "",
    studyTimeBlocks: {},
  },
];

export const MOOD_EMOJIS: { [key: string]: string } = {
  best: "🤩",
  good: "😊",
  normal: "😐",
  bad: "😞",
  worst: "😫",
};

// 📅 멘티의 일일 학습 계획 피드백 요청 (Mock)
export const PENDING_PLAN_REVIEWS = [
  {
    id: 101,
    studentId: "s1",
    studentName: "김멘티",
    date: new Date(2026, 1, 2), // Feb 2 (Today)
    dailyGoal: "수학 기하 벡터 완벽 이해하기",
    totalStudyTime: 0, // In progress
    planCount: 5,
    completedCount: 2,
    comment: "선생님, 오늘 계획인데 수학 비중이 좀 많은 것 같아요. 괜찮을까요?",
    status: "pending", // pending, reviewed
  },
  {
    id: 102,
    studentId: "s2",
    studentName: "이서울",
    date: new Date(2026, 1, 2),
    dailyGoal: "영어 단어 100개 암기 도전",
    totalStudyTime: 120,
    planCount: 3,
    completedCount: 1,
    comment: "영어 단어 위주로 짰습니다.",
    status: "pending",
  },
];

// ❓ 학생 질문 모음 (Mock) -> USER_TASKS의 userQuestion과 연결될 수도 있고 독립적일 수도 있음
export const STUDENT_QUESTIONS = [
  {
    id: 201,
    studentId: "s1",
    studentName: "김멘티",
    taskId: "u1",
    taskTitle: "수학 수1 등차수열 복습",
    question:
      "선생님, 등차수열의 합 공식에서 n(n+1)/2가 왜 나오는지 이해가 안 가요...",
    date: new Date(2026, 0, 29, 14, 30),
    isAnswered: true,
  },
  {
    id: 202,
    studentId: "s1",
    studentName: "김멘티",
    taskId: 5, // MENTOR_TASKS id:5
    taskTitle: "미적분 킬러문항 3개년 기출 분석",
    question:
      "30번 문제 해설지 3번째 줄에서 왜 갑자기 미분을 하는지 모르겠어요. 그래프 개형 추론인가요?",
    date: new Date(2026, 1, 2, 16, 15),
    isAnswered: false,
  },
];

// 📝 플래너 종합 피드백 (Mock)
export const PLANNER_FEEDBACKS = [
  {
    id: 1,
    date: new Date(2026, 0, 29),
    summary: "전반적으로 계획 이행률이 높습니다. 특히 수학 학습 시간이 목표량을 초과 달성한 점이 인상적입니다.",
    mentorName: "김멘토",
    comment: "국어 비문학 분석 깊이를 조금 더 더하면 좋겠습니다. 주말에는 휴식도 중요합니다.",
    strengths: ["계획 이행률 우수", "수학 학습량 달성"],
    nextSteps: ["비문학 분석 심화", "영어 단어 암기 시간 확보"],
  },
  {
    id: 2,
    date: new Date(2026, 1, 1),
    summary: "영어 단어 암기 루틴이 잘 잡혀있네요. 기하 벡터 오답노트 정리는 훌륭하지만, 문제 풀이 시간을 조금 더 단축해보는 연습이 필요합니다.",
    mentorName: "이멘토",
    comment: "기하 벡터 문제는 시간을 재고 푸는 연습을 해보세요. 오답노트는 지금처럼 유지하면 좋습니다.",
    strengths: ["영어 단어 암기 습관", "오답노트 정리"],
    nextSteps: ["기하 벡터 시간 단축", "주간 모의고사 준비"],
  },
];

