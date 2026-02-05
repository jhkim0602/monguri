# 멘티 페이지 기능 명세 및 구현 현황

작성일: 2026-02-05  
범위: 멘티(Home/Planner/Calendar/MyPage) + 멘토 페이지 현황/기획

---

## 0) 현재 라우팅/전제

- 랜딩: `/landing`
- 멘티 홈: `/home`
- 플래너: `/planner`, `/planner/[id]`
- 캘린더: `/calendar`
- 마이페이지: `/mypage`
- 마이페이지 피드백 모아보기: `/mypage/feedbacks`
- 루트(`/`)는 현재 `/landing`으로 redirect
- 로그인 상태 저장/세션은 아직 미구현 (Mock/조건부 라우팅 예정)

---

## 1) 멘티 홈(Home) 기능 명세

**파일:** `src/app/(mentee)/home/page.tsx`  
**핵심 목적:** 오늘 기준 학습 요약 + 피드백 접근 + 주간 캘린더 요약

### 1-1. 상단 웰컴/프로필
- **내용**
  - 닉네임, 역할, D-Day 표시
  - 프로필 아바타 표시
- **데이터 소스**
  - `USER_PROFILE` (mock)
- **구현 상태**
  - UI 완료 (mock 데이터)
  - 로그인/실사용 데이터 연동 없음

### 1-2. Daily Focus 카드 (오늘/선택 날짜 과제 요약)
- **기능**
  - 날짜 이동(이전/다음)
  - 선택 날짜의 멘토 과제 리스트 표시
  - 완료 개수/진척도 바 표시
  - 과제 클릭 → `/planner/[id]` 이동
- **데이터 소스**
  - `WEEKLY_SCHEDULE`, `MENTOR_TASKS` (mock)
- **구현 상태**
  - UI/로직 완료
  - 날짜 기준은 demo 고정(2026-02-02) 사용

### 1-3. Weekly Calendar 요약
- **기능**
  - 일주일 날짜 + 키워드(과제 제목 1~2단어) 표시
  - 날짜 클릭 → Home의 선택 날짜 변경
- **데이터 소스**
  - `WEEKLY_SCHEDULE` (mock)
- **구현 상태**
  - UI/로직 완료

### 1-4. 도착한 피드백 목록
- **기능**
  - 피드백 있는 멘토 과제 미리보기 (최대 3개)
  - 과제 클릭 → `/planner/[id]`
  - “플래너에서 확인하기” 버튼
- **데이터 소스**
  - `MENTOR_TASKS` (mock)
- **구현 상태**
  - UI/로직 완료
  - 실제 피드백/상태 동기화 미구현

---

## 2) 플래너(Planner) 기능 명세

**파일:** `src/app/(mentee)/planner/page.tsx`  
**핵심 목적:** 일자별 학습 계획/타임라인 관리

### 2-1. 날짜 내비게이션
- **기능**
  - 날짜 이동(이전/다음)
  - D-Day 표시
- **구현 상태**
  - UI/로직 완료 (demo 날짜 고정)

### 2-2. 학습 계획(Task) 목록
- **기능**
  - 멘토 과제 + 나의 과제 + 캘린더 커스텀 일정 합산 표시
  - 완료 체크
  - 시간 범위(시작/종료) 설정 (10분 단위 스피너)
  - 삭제
- **데이터 소스**
  - `MENTOR_TASKS`, `USER_TASKS` (mock)
  - `mentee-calendar-events` (로컬스토리지)
- **저장**
  - `planner-day-tasks` (로컬스토리지)
- **구현 상태**
  - UI/로직 완료
  - 서버 연동 없음

### 2-3. 학습 타임라인(Study Timeline)
- **기능**
  - 10분 단위 블록 타임라인
  - 과목 색상 레전드
- **데이터 소스**
  - 현재 tasks 기반으로 생성
- **구현 상태**
  - UI/로직 완료

### 2-4. Task 상세 모달
- **기능**
  - 학습자료 탭 / 과제 제출 탭
  - 파일 업로드 UI(실제 업로드 미구현)
  - 멘토 피드백 표시
- **구현 상태**
  - UI만 구현
  - 파일 업로드/제출/피드백 연동 없음

---

## 3) 캘린더(Calendar) 기능 명세

**파일:** `src/app/(mentee)/calendar/page.tsx`  
**핵심 목적:** 월간/주간(모아보기) 캘린더 및 반복 일정 생성

### 3-1. 월간 캘린더
- **기능**
  - 월간 그리드 표시
  - 각 날짜 키워드(멘토 과제/나의 과제 요약)
  - **미팅 확정일 표시**: 상단 라인 배지
  - 날짜 클릭 → 상세(하단 섹션) 표시
- **데이터 소스**
  - `planner-day-tasks` (로컬스토리지)
  - `WEEKLY_SCHEDULE` (mock)
  - `mentor-meeting-records` (로컬스토리지)
- **구현 상태**
  - UI/로직 완료
  - 미팅 표시는 scheduled/completed + scheduledAt 기준

### 3-2. 플래너 모아보기(주간/월간 카드)
- **기능**
  - 일자별 카드(미니 플래너)
  - 카드 클릭 → 상세 모달
- **구현 상태**
  - UI/로직 완료
  - **미팅 표시/도움말은 의도적으로 제외됨**

### 3-3. 일정 추가(반복)
- **기능**
  - 단일/매주/격주/매월 반복 일정 생성
  - 날짜 범위/요일 선택
- **저장**
  - `mentee-calendar-events` (로컬스토리지)
- **구현 상태**
  - UI/로직 완료

### 3-4. 날짜 상세/피드백 섹션
- **기능**
  - 해당 날짜의 과제 리스트
  - 멘토 피드백 섹션
- **데이터 소스**
  - `MENTOR_TASKS`, `USER_TASKS` (mock)
- **구현 상태**
  - UI/로직 완료

---

## 4) 마이페이지(MyPage) 기능 명세

**파일:** `src/app/(mentee)/mypage/page.tsx`  
**핵심 목적:** 프로필/성취도/피드백/미팅 관리

### 4-1. 프로필 편집
- **기능**
  - 닉네임, 한 줄 소개, 아바타 변경
  - 모달 저장
- **구현 상태**
  - 로컬 상태만 반영 (저장/업로드 없음)

### 4-2. 피드백 모아보기 (신규)
- **기능**
  - 날짜 이동형 플래너 요약(좌: Task, 우: Timeline)
  - Task 클릭 → `/planner/[id]` 상세 이동
  - 플래너(하루) 단위 종합 피드백/코멘트 표시
- **데이터 소스**
  - `MENTOR_TASKS`, `USER_TASKS`, `PLANNER_FEEDBACKS` (mock)
  - `planner-day-tasks` (로컬스토리지 우선)
- **구현 상태**
  - UI/로직 완료 (멘토 입력/연동 없음)

### 4-3. 멘토 미팅
- **기능**
  - 미팅 신청(주제/태스크/희망일정/메모)
  - 태스크 선택 모달 (검색/필터/과목 필터)
  - **미팅 신청 기록**(requested)과 **미팅 기록**(scheduled/completed) 분리
- **저장**
  - `mentor-meeting-records` (로컬스토리지)
- **구현 상태**
  - UI/로직 완료
  - 멘토 확정/Zoom 링크는 mock 상태

---

## 5) 구현 현황 요약

- **UI/UX는 대부분 완료**
  - Home/Planner/Calendar/MyPage 전반
- **데이터는 대부분 mock + localStorage**
  - `mentor-meeting-records`, `planner-day-tasks`, `mentee-calendar-events`
- **실제 인증/권한/백엔드 연동 미구현**
  - 로그인 상태 기반 분기 없음
  - 파일 업로드/피드백/미팅 확정 모두 mock 수준

---

## 6) 멘토 페이지 현황

**경로:** `src/app/(mentor)/mentor/*`

### 현재 존재 페이지
- 대시보드 `/mentor` (통계/학생 목록 mock)
- 학생 관리 `/mentor/students`
- 피드백 관리 `/mentor/feedback`
- 라이브 강의 `/mentor/live`
- 일정 관리 `/mentor/schedule`
- 채팅 `/mentor/chat`
- 자료실 `/mentor/library`
- 상담 신청 `/mentor/applications`
- 설정 `/mentor/settings`

### 현 상태
- 대부분 **UI + mock 데이터만 구현**
- 실 데이터 CRUD/API 연동 없음

---

## 7) 멘토 페이지 기획 (멘티 기능 연동 관점)

### 7-1. 과제(멘토 과제) 관리
- **멘토가 해야 할 일**
  - 과제 생성/배정 (멘티별/과목별)
  - 제출 여부 확인 및 피드백 작성
- **멘티 영향**
  - Home/Planner/Calendar에 반영
  - 피드백 리스트 갱신
- **필요 API**
  - POST /mentor/tasks
  - PATCH /mentor/tasks/:id (피드백, 상태)
  - GET /mentee/tasks

### 7-2. 미팅 요청/확정 프로세스
- **멘티**: 마이페이지에서 미팅 요청 → status=requested
- **멘토**: 신청 목록 확인, 시간 확정 → status=scheduled
- **멘티**: 확정되면 캘린더에 라인 표시
- **옵션**: Zoom 링크는 선택 (없어도 캘린더 표시)
- **필요 API**
  - POST /meetings (멘티 요청)
  - PATCH /meetings/:id (멘토 확정/완료)
  - GET /meetings (멘티/멘토 조회)

### 7-3. 피드백/인증 흐름
- **멘티**: 과제 제출(파일/코멘트)
- **멘토**: 피드백 작성/상태 변경
- **멘티**: Home/Planner 피드백 표시
- **필요 API**
  - POST /tasks/:id/submissions
  - POST /tasks/:id/feedback

### 7-4. 채팅/상담
- **멘토**: 학생별 상담/질문 응답
- **멘티**: 질문 등록 & 피드백 수신
- **필요 API**
  - GET /chats
  - POST /chats/:id/messages

### 7-5. 일정/라이브/자료실
- **멘토**: 일정/라이브/자료 업로드
- **멘티**: 학습 자료 다운로드/라이브 참여
- **필요 API**
  - 일정: GET/POST /mentor/schedules
  - 라이브: POST /mentor/live
  - 자료: POST/GET /mentor/library

---

## 8) 우선순위 제안 (개발 로드맵)

1. **로그인/세션 구조 확정**  
   - `/` → 로그인 여부에 따라 `/landing` 또는 `/home`
2. **멘토 과제 CRUD + 멘티 반영**
3. **미팅 요청/확정 + 캘린더 표시**
4. **과제 제출/피드백 연동**
5. **채팅/자료실/라이브 확장**

---

## 9) 현 상태에서 바로 개선 가능한 사항

- 멘티 Home/Planner에서 데이터 소스를 mock → API로 분리
- 미팅 확정 시 자동 캘린더 표시 (이미 UI 연결됨, 데이터만 연결하면 됨)
- 피드백 상태 변경 시 Home/Planner 자동 갱신

---

필요하면 이 문서를 기반으로 **API 스펙, 데이터 모델, DB 스키마**까지 이어서 작성할 수 있습니다.
