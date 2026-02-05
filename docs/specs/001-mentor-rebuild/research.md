# 현황 분석 (Mock 데이터/목적)

## 1) 멘티 영역 Mock 데이터
### 위치
- `src/constants/mentee/index.ts`
- `src/constants/mentee/columns.ts`

### 구성/목적
- **MENTOR_TASKS**: 멘토가 배정한 과제 목록(상태/피드백/제출물 포함)
- **USER_TASKS**: 멘티 자율 과제 목록
- **WEEKLY_SCHEDULE**: 홈/캘린더 요약에 쓰는 주간 일정 키워드
- **DAILY_RECORDS**: 학습 시간/기분/메모 기록
- **COLUMN_SERIES / COLUMN_ARTICLES**: 칼럼 리스트/시리즈 표시용 콘텐츠

### 특징
- 날짜는 2026-02-02 기준으로 고정된 mock 컨텍스트
- 제출/피드백/코멘트 상태를 UI 검증용으로 포함

## 2) 멘토 영역 Mock 데이터
### 위치/형식
- `src/app/(mentor)/mentor/page.tsx`: 대시보드 통계/학생 목록 배열
- `src/app/(mentor)/mentor/applications/page.tsx`: 신규 상담 신청 MOCK_APPLICATIONS
- `src/app/(mentor)/mentor/feedback/page.tsx`: 제출물/질문 UPLOADS
- `src/app/(mentor)/mentor/mentees/[id]/page.tsx`: 학생 상세 MOCK_STUDENT, MOCK_TIMELINE_BLOCKS
- `src/app/(mentor)/mentor/sessions/[id]/page.tsx`: MOCK_IMAGES

### 특징
- 대부분 페이지 내부 상수로 존재 → 재사용/연동 불가
- mentor/mentee 데이터 연결이 단절되어 있음

## 3) 로컬스토리지 기반 데이터
- `planner-day-tasks`
- `mentee-calendar-events`
- `mentor-meeting-records`
- `column-bookmarks`

## 4) 결론
- mentor/mentee 간 데이터 연결이 없고, mock 데이터가 흩어져 있음
- mentor 기능 구현을 위해 **단일 데이터 모델 + API 계약**이 우선 필요

