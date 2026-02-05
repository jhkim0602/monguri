// 📚 멘토가 설정한 과제들 (deadline 기준으로 정리)
export const MENTOR_TASKS = [
  {
    // 📚 멘토 과제 1: 피드백 완료 (1/29)
    id: 1,
    subject: "국어",
    title: "국어 문학 현대시 3지문 분석",
    status: "feedback_completed",
    badgeColor: "bg-green-100 text-green-700",
    description: "EBS 연계 현대시 작품 3지문 분석 및 문제 풀이. 시어의 상징적 의미와 시상 전개 방식 파악.",
    categoryId: "korean",
    mentorFeedback: "시어 분석이 매우 정확합니다! 특히 현대시의 상징적 의미 파악 능력이 크게 향상되었네요.",
    deadline: new Date(2026, 0, 29),
    attachments: [
      { name: "문학3지문_분석자료.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80" }
    ],
    submissions: [
      { name: "국어숙제_제출.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80" }
    ],
    mentorComment: "시어 분석이 매우 정확합니다! 특히 현대시의 상징적 의미 파악 능력이 크게 향상되었네요. 다음엔 시상 전개 방식도 함께 정리해보세요.",
    feedbackFiles: [],
    isMentorTask: true,
    completed: true,
    studyRecord: { photo: "제출함", note: "현대시 분석 완료" },
    hasMentorResponse: true,
    startTime: "09:00",
    endTime: "10:00"
  },
  {
    // 📚 멘토 과제 2: 피드백 완료 (1/30)
    id: 2,
    subject: "영어",
    title: "영어 순서배열 15문항",
    status: "feedback_completed",
    badgeColor: "bg-pink-100 text-pink-700",
    description: "연결어와 지시어 찾기 연습. 논리적 흐름 파악이 핵심.",
    categoryId: "english",
    mentorFeedback: "지시어 근거 표시가 좋아졌고, 연결어 흐름 파악이 안정적이에요. 다음엔 문장 간 관계를 화살표로 요약해보세요.",
    deadline: new Date(2026, 0, 30),
    attachments: [
      { name: "순서배열_문제.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80" }
    ],
    submissions: [
      { name: "순서배열_제출.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80" }
    ],
    mentorComment: "지시어 근거 표시가 좋아졌고, 연결어 흐름 파악이 안정적이에요. 다음엔 문장 간 관계를 화살표로 요약해보세요.",
    feedbackFiles: [],
    isMentorTask: true,
    completed: true,
    studyRecord: { photo: "제출함", note: "연결어 찾기 연습" },
    hasMentorResponse: true,
    startTime: "10:30",
    endTime: "11:30"
  },
  {
    // 📚 멘토 과제 3: 피드백 완료 (2/1)
    id: 3,
    subject: "수학",
    title: "수학 기하 벡터 10문항",
    status: "feedback_completed",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "평면벡터와 공간벡터 개념 정리 및 내적 활용 문제",
    categoryId: "math",
    mentorFeedback: "내적 적용 문제가 정확했고, 풀이 과정이 깔끔합니다. 다음에는 벡터 좌표 설정을 더 빠르게 하도록 연습해보세요.",
    deadline: new Date(2026, 1, 1),
    attachments: [
      { name: "기하벡터_문제.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" }
    ],
    submissions: [
      { name: "기하_풀이_제출.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" }
    ],
    mentorComment: "내적 적용 문제가 정확했고, 풀이 과정이 깔끔합니다. 다음에는 벡터 좌표 설정을 더 빠르게 하도록 연습해보세요.",
    feedbackFiles: [],
    isMentorTask: true,
    completed: true,
    studyRecord: { photo: "제출함", note: "벡터 내적 개념 복습" },
    hasMentorResponse: true,
    startTime: "14:00",
    endTime: "15:00"
  },
  {
    // 📚 멘토 과제 4: 오늘 마감 - 피드백 완료 (2/2)
    id: 4,
    subject: "영어",
    title: "EBS 연계 지문 빈칸추론 20문항",
    status: "feedback_completed",
    badgeColor: "bg-pink-100 text-pink-700",
    description: "수능특강 영어독해 3과~5과 빈칸추론 유형 집중 학습. 근거 문장 표시하며 풀이.",
    categoryId: "english",
    mentorFeedback: "근거 문장 표시가 대부분 정확했고, 정답 근거를 찾는 속도가 빨라졌어요. 오답 3문항은 선택지 함정에 유의하세요.",
    deadline: new Date(2026, 1, 2),
    attachments: [
      { name: "영어_빈칸추론_모음집.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80" }
    ],
    submissions: [
      { name: "영어과제_제출_서연.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" },
      { name: "문제풀이_사진.jpg", type: "image", url: "#", previewUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80" }
    ],
    mentorComment: "근거 문장 표시가 대부분 정확했고, 정답 근거를 찾는 속도가 빨라졌어요. 오답 3문항은 선택지 함정에 유의하세요.",
    feedbackFiles: [],
    isMentorTask: true,
    completed: true,
    studyRecord: { photo: "제출함", note: "빈칸 근거 찾기 연습" },
    hasMentorResponse: true,
    startTime: "16:00",
    endTime: "17:00"
  },
  {
    // 📚 멘토 과제 5: 오늘 마감 - 아직 미제출 (2/2)
    id: 5,
    subject: "수학",
    title: "미적분 킬러문항 3개년 기출 분석",
    status: "pending",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "2022~2024학년도 수능 미적분 30번 문제 풀이 및 오답노트 작성. 공통 패턴 정리 필수.",
    categoryId: "math",
    mentorFeedback: "아직 피드백이 등록되지 않았습니다.",
    deadline: new Date(2026, 1, 2),
    attachments: [
      { name: "미적분_킬러_패턴분석.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" }
    ],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    completed: false,
    studyRecord: null,
    hasMentorResponse: false
  },
  {
    // 📚 멘토 과제 6: 내일 마감 (2/3)
    id: 6,
    subject: "수학",
    title: "수학1 삼각함수 그래프 20문항",
    status: "pending",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "삼각함수 주기와 대칭성 활용 문제 집중 공략. 그래프 변환 연습 필수.",
    categoryId: "math",
    mentorFeedback: "아직 피드백이 등록되지 않았습니다.",
    deadline: new Date(2026, 1, 3),
    attachments: [
      { name: "삼각함수_그래프.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" }
    ],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    completed: false,
    studyRecord: null,
    hasMentorResponse: false
  },
  {
    // 📚 멘토 과제 7: 2/4 마감
    id: 7,
    subject: "국어",
    title: "언어와 매체 개념 정리",
    status: "pending",
    badgeColor: "bg-green-100 text-green-700",
    description: "음운의 변동 파트 백지 복습. 비음화, 유음화, 된소리되기 등 주요 음운 변동 정리.",
    categoryId: "korean",
    mentorFeedback: "아직 피드백이 등록되지 않았습니다.",
    deadline: new Date(2026, 1, 4),
    attachments: [
      { name: "언어와매체_개념.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80" }
    ],
    submissions: [],
    mentorComment: "",
    feedbackFiles: [],
    isMentorTask: true,
    completed: false,
    studyRecord: null,
    hasMentorResponse: false
  },
  {
    // 📚 멘토 과제 8: 2/4 마감 - 피드백 완료 (성취 리포트 확인용)
    id: 8,
    subject: "수학",
    title: "미적분 실전 모의 1회",
    status: "feedback_completed",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "실전 모의 1회분 풀이 및 오답 원인 분석. 시간 배분을 체크하면서 풀이.",
    categoryId: "math",
    mentorFeedback: "시간 배분이 좋아졌고, 21번 실수가 줄었어요. 30번은 풀이 전 조건 정리부터 하세요.",
    deadline: new Date(2026, 1, 4),
    attachments: [
      { name: "모의_1회_문제.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" }
    ],
    submissions: [
      { name: "모의1회_제출.pdf", type: "pdf", url: "#", previewUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80" }
    ],
    mentorComment: "풀이 과정이 안정적이야. 실전에서 시간 체크하면서 그대로 유지해보자.",
    feedbackFiles: [],
    isMentorTask: true,
    completed: true,
    studyRecord: { photo: "제출함", note: "모의고사 1회 제출 완료" },
    hasMentorResponse: true,
    startTime: "18:00",
    endTime: "19:30"
  }
];

// ✏️ 멘티가 직접 설정한 과제들 (자율 학습)
export const USER_TASKS = [
  {
    // ✏️ 멘티 과제 1: 완료, 질문 & 멘토 응답 있음 (1/29)
    id: 'u1',
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
    userQuestion: "선생님, 등차수열의 합 공식에서 n(n+1)/2가 왜 나오는지 이해가 안 가요",
    hasMentorResponse: true,
    mentorComment: "좋은 질문이네! 등차수열의 합은 첫 항과 마지막 항의 평균에 항의 개수를 곱한 것이야. Σk = n(n+1)/2는 1부터 n까지의 합이므로, 이를 증명하려면 가우스의 방법을 사용하면 돼. 1+2+...+n과 n+(n-1)+...+1을 더하면 모두 (n+1)이 n개 나오니까 n(n+1)/2가 되는 거야.",
    attachments: [],
    submissions: [],
    feedbackFiles: [],
    startTime: "11:30",
    endTime: "12:30"
  },
  {
    // ✏️ 멘티 과제 2: 완료, 질문 없음 (2/2)
    id: 'u2',
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
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400"
      ],
      note: "오늘 외운 단어들입니다. 어려운 단어 위주로 정리했어요."
    },
    userQuestion: undefined,
    hasMentorResponse: false,
    attachments: [],
    submissions: [],
    mentorComment: "",
    feedbackFiles: []
  },
  {
    // ✏️ 멘티 과제 3: 완료 (1/31)
    id: 'u3',
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
    feedbackFiles: []
  },
  {
    // ✏️ 멘티 과제 4: 완료 (2/1)
    id: 'u4',
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
    feedbackFiles: []
  },
  {
    // ✏️ 멘티 과제 5: 오늘 진행 중 (2/2)
    id: 'u5',
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
    endTime: "14:00"
  },
  {
    // ✏️ 멘티 과제 6: 오늘 진행 예정 (2/2)
    id: 'u6',
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
    endTime: "15:00"
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

export const PLANNER_FEEDBACKS = [
  {
    date: new Date(2026, 1, 2),
    summary: "영어 집중력이 좋았고, 수학 풀이 흐름이 더 안정됐습니다.",
    comment: "오늘은 과제 마감이 많았는데, 제출 속도와 집중력이 좋았어요. 특히 영어 빈칸추론 풀이에서 근거 문장을 잘 표시한 점이 좋아요. 수학 킬러문항은 풀이 시작 전에 조건 정리를 먼저 해보면 시간 단축에 도움이 될 거예요.",
    strengths: [
      "영어 지문 근거 표시가 명확함",
      "마감 과제를 모두 계획에 맞게 제출",
      "집중 시간대가 일정하게 유지됨"
    ],
    nextSteps: [
      "미적분 킬러문항은 풀이 전 조건 정리 루틴 만들기",
      "영어 오답 노트에 빈칸추론 패턴 정리"
    ],
    mentorName: "서울대쌤"
  },
  {
    date: new Date(2026, 1, 1),
    summary: "수학 과제 완수율이 높고, 자기 주도성이 좋아졌습니다.",
    comment: "기하 벡터 제출이 깔끔했고, 오답노트 정리가 잘 되어 있어요. 앞으로는 풀이 과정을 더 간결하게 정리하는 연습을 해봅시다.",
    strengths: [
      "수학 과제 제출이 안정적",
      "오답 노트 정리가 체계적"
    ],
    nextSteps: [
      "풀이 과정 간결화 연습",
      "주요 공식 요약 페이지 작성"
    ],
    mentorName: "서울대쌤"
  },
  {
    date: new Date(2026, 1, 3),
    summary: "국어 문법 정리는 안정적이지만, 시간 배분이 들쭉날쭉했어요.",
    comment: "국어 문법 강의 메모는 좋았고, 영어 빈칸추론은 근거 문장 표시가 부족했어요. 시간을 고르게 쓰는 연습이 필요합니다.",
    strengths: [
      "국어 문법 개념 정리 깔끔함",
      "과제 제출 일정 준수"
    ],
    nextSteps: [
      "영어 빈칸추론은 근거 문장 2개 이상 표시",
      "학습 타이머로 50분/10분 루틴 적용"
    ],
    mentorName: "연대쌤"
  },
  {
    date: new Date(2026, 1, 4),
    summary: "수학 모의 풀이에서 실수가 줄었고, 복습 집중도가 높았습니다.",
    comment: "미적분 실전 모의 풀이 과정이 깔끔했어요. 다만 국어 언매 개념은 암기보다 적용 예제로 확인하는 습관이 필요합니다.",
    strengths: [
      "수학 풀이 과정 정리 명확",
      "오답 체크 후 바로 복습함"
    ],
    nextSteps: [
      "언어와 매체 개념은 예제 3개씩 적용",
      "수학 모의는 시간제한 5분 단축 목표"
    ],
    mentorName: "고려쌤"
  },
  {
    date: new Date(2026, 1, 5),
    summary: "주간 모의고사 후 피로감이 있었지만, 영어 테스트 집중력이 좋았어요.",
    comment: "장시간 학습 뒤 회복 루틴을 넣으면 다음날 집중도가 더 좋아질 것 같아요. 영어 단어 테스트는 정확도가 높았습니다.",
    strengths: [
      "영어 단어 테스트 정확도 우수",
      "장시간 학습 유지"
    ],
    nextSteps: [
      "모의고사 후 20분 휴식/정리 루틴",
      "수학 풀이 속도 체크(문항당 시간 기록)"
    ],
    mentorName: "서울대쌤"
  },
  {
    date: new Date(2026, 0, 31),
    summary: "국어 독서 비문학은 꾸준하지만, 영어 집중이 약했습니다.",
    comment: "국어 독서 루틴은 안정적이에요. 영어는 지문 길이에 비해 집중이 끊기는 편이라 시간대 분리 학습이 필요합니다.",
    strengths: [
      "국어 독서 루틴 유지",
      "과제 미루지 않고 진행"
    ],
    nextSteps: [
      "영어 지문을 15분 단위로 나눠 풀이",
      "독서 오답 노트에 근거 문장 표시"
    ],
    mentorName: "이화쌤"
  }
];

export const SCHEDULE_HOURS = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 6;
  return hour < 10 ? `0${hour}` : `${hour}`;
});

// 주간 학습 계획 (MENTOR_TASKS + USER_TASKS와 연동)
export const WEEKLY_SCHEDULE = [
  {
    date: new Date(2026, 0, 29), // Jan 29, 2026 (수요일)
    events: [
      { id: 1, title: "국어 문학 현대시 3지문 분석", categoryId: "korean", taskType: "mentor" }, // MENTOR_TASKS id:1
      { id: 'u1', title: "수학 수1 등차수열 복습", categoryId: "math", taskType: "user" }, // USER_TASKS id:u1
      { id: 301, title: "영어 듣기 평가 연습", categoryId: "english", taskType: "plan", startTime: "15:00", endTime: "16:00", isMentorTask: true },
    ],
  },
  {
    date: new Date(2026, 0, 30), // Jan 30, 2026 (목요일)
    events: [
      { id: 2, title: "영어 순서배열 15문항", categoryId: "english", taskType: "mentor" }, // MENTOR_TASKS id:2
      { id: 302, title: "국어 현대시 복습", categoryId: "korean", taskType: "plan", startTime: "13:00", endTime: "14:00", isMentorTask: true },
    ],
  },
  {
    date: new Date(2026, 0, 31), // Jan 31, 2026 (금요일)
    events: [
      { id: 'u3', title: "국어 독서 비문학 2지문", categoryId: "korean", taskType: "user" }, // USER_TASKS id:u3
      { id: 303, title: "수학 기출 풀이", categoryId: "math", taskType: "plan", startTime: "19:00", endTime: "20:00", isMentorTask: true },
    ],
  },
  {
    date: new Date(2026, 1, 1), // Feb 1, 2026 (토요일)
    events: [
      { id: 3, title: "수학 기하 벡터 10문항", categoryId: "math", taskType: "mentor" }, // MENTOR_TASKS id:3
      { id: 'u4', title: "수학 기출 오답노트 정리", categoryId: "math", taskType: "user" }, // USER_TASKS id:u4
      { id: 304, title: "영단어 복습", categoryId: "english", taskType: "plan", startTime: "09:00", endTime: "09:30", isMentorTask: true },
    ],
  },
  {
    date: new Date(2026, 1, 2), // Feb 2, 2026 (일요일) ⭐ 오늘
    events: [
      { id: 4, title: "EBS 연계 지문 빈칸추론 20문항", categoryId: "english", taskType: "mentor" }, // MENTOR_TASKS id:4
      { id: 5, title: "미적분 킬러문항 3개년 기출 분석", categoryId: "math", taskType: "mentor" }, // MENTOR_TASKS id:5
      { id: 'u5', title: "국어 비문학 독해 3지문", categoryId: "korean", taskType: "user" }, // USER_TASKS id:u5
      { id: 'u6', title: "영어 듣기 평가 10문항", categoryId: "english", taskType: "user" }, // USER_TASKS id:u6
      { id: 'u2', title: "영어 단어 50개 암기", categoryId: "english", taskType: "user" }, // USER_TASKS id:u2
    ],
  },
  {
    date: new Date(2026, 1, 3), // Feb 3, 2026 (월요일)
    events: [
      { id: 6, title: "수학1 삼각함수 그래프 20문항", categoryId: "math", taskType: "mentor" }, // MENTOR_TASKS id:6
      { id: 305, title: "국어 문법 강의 1강", categoryId: "korean", taskType: "plan", startTime: "10:00", endTime: "11:00", isMentorTask: true },
      { id: 306, title: "영어 빈칸추론 5문제", categoryId: "english", taskType: "plan", startTime: "13:30", endTime: "14:30", isMentorTask: true },
    ],
  },
  {
    date: new Date(2026, 1, 4), // Feb 4, 2026 (화요일)
    events: [
      { id: 7, title: "언어와 매체 개념 정리", categoryId: "korean", taskType: "mentor" }, // MENTOR_TASKS id:7
      { id: 8, title: "미적분 실전 모의 1회", categoryId: "math", taskType: "mentor" }, // MENTOR_TASKS id:8
      { id: 307, title: "수학 미분 챕터 복습", categoryId: "math", taskType: "plan", startTime: "11:00", endTime: "12:00", isMentorTask: true },
      { id: 308, title: "영어 독해 3지문", categoryId: "english", taskType: "plan", startTime: "15:00", endTime: "16:00", isMentorTask: true },
    ],
  },
  {
    date: new Date(2026, 1, 5), // Feb 5, 2026 (수요일)
    events: [
      { id: 309, title: "주간 모의고사", categoryId: "math", taskType: "plan", startTime: "09:00", endTime: "12:00", isMentorTask: true },
      { id: 310, title: "영어 단어 테스트", categoryId: "english", taskType: "plan", startTime: "13:00", endTime: "13:30", isMentorTask: true },
    ],
  }
];

// 일별 학습 기록 (학습 시간, 기분, 메모, 타임블록)
export const DAILY_RECORDS = [
  {
    date: new Date(2026, 0, 26),
    studyTime: 200,
    mood: "good",
    memo: "오늘은 컨디션이 좋았다. 수학 문제가 잘 풀림!",
    studyTimeBlocks: {
      "14:00": "math", "14:10": "math", "14:20": "math", "14:30": "math",
      "16:00": "english", "16:10": "english", "16:20": "english"
    }
  },
  {
    date: new Date(2026, 0, 27),
    studyTime: 150,
    mood: "normal",
    memo: "조금 피곤했지만 계획한 건 다 끝냈다.",
    studyTimeBlocks: {
      "15:00": "korean", "15:10": "korean", "15:20": "korean",
      "19:00": "math", "19:10": "math", "19:20": "math"
    }
  },
  {
    date: new Date(2026, 0, 28),
    studyTime: 120,
    mood: "good",
    memo: "국어 비문학이 계속 어렵다 ㅠㅠ",
    studyTimeBlocks: {
      "13:00": "korean", "13:10": "korean", "13:20": "korean", "13:30": "korean"
    }
  },
  {
    date: new Date(2026, 0, 29),
    studyTime: 240,
    mood: "best",
    memo: "국어 현대시 분석 완료! 수학 등차수열도 이해했다. 역대급 집중력!",
    studyTimeBlocks: {
      "09:00": "korean", "09:10": "korean", "09:20": "korean", "09:30": "korean",
      "14:00": "math", "14:10": "math", "14:20": "math", "14:30": "math",
      "19:00": "english", "19:10": "english", "19:20": "english", "19:30": "english"
    }
  },
  {
    date: new Date(2026, 0, 30),
    studyTime: 180,
    mood: "normal",
    memo: "영어 순서배열 제출하고 단어 50개 외웠다. 피곤하지만 만족스러움.",
    studyTimeBlocks: {
      "10:00": "english", "10:10": "english", "10:20": "english", "10:30": "english",
      "15:00": "english", "15:10": "english", "15:20": "english"
    }
  },
  {
    date: new Date(2026, 0, 31),
    studyTime: 165,
    mood: "normal",
    memo: "1월의 마지막 날. 국어 독서 2지문 풀이 완료. 내일도 화이팅!",
    studyTimeBlocks: {
      "13:00": "korean", "13:10": "korean", "13:20": "korean",
      "16:00": "korean", "16:10": "korean", "16:20": "korean", "16:30": "korean"
    }
  },
  {
    date: new Date(2026, 1, 1),
    studyTime: 280,
    mood: "best",
    memo: "2월 시작! 수학 기하 벡터 제출했다. 오답노트 정리도 끝!",
    studyTimeBlocks: {
      "09:00": "math", "09:10": "math", "09:20": "math", "09:30": "math", "09:40": "math",
      "14:00": "math", "14:10": "math", "14:20": "math", "14:30": "math",
      "20:00": "english", "20:10": "english", "20:20": "english"
    }
  },
  {
    date: new Date(2026, 1, 2),
    studyTime: 140,
    mood: "good",
    memo: "영어 빈칸추론 20문항 제출! 오늘도 열심히 했다.",
    studyTimeBlocks: {
      "09:00": "korean", "09:10": "korean", "09:20": "korean",
      "10:30": "english", "10:40": "english", "10:50": "english", "11:00": "english"
    }
  },
  {
    date: new Date(2026, 1, 3),
    studyTime: 0,
    mood: "normal",
    memo: "",
    studyTimeBlocks: {}
  },
  {
    date: new Date(2026, 1, 4),
    studyTime: 0,
    mood: "normal",
    memo: "",
    studyTimeBlocks: {}
  },
  {
    date: new Date(2026, 1, 5),
    studyTime: 0,
    mood: "normal",
    memo: "",
    studyTimeBlocks: {}
  },
];

export const MOOD_EMOJIS: { [key: string]: string } = {
  best: "🤩",
  good: "😊",
  normal: "😐",
  bad: "😞",
  worst: "😫"
};
