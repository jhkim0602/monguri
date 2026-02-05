# Mentor 백엔드 우선순위 보고서

## 전제
- 아키텍처는 `AiContext/Backend_Patterns.md`의 Pattern A를 따른다.
  - Route Handler: `app/api/**/route.ts` (HTTP만)
  - Service: `src/services/**` (비즈니스 로직)
  - Repository: `src/repositories/**` (Supabase 전용)
  - Validator: `src/lib/validators/**` (Zod)
- DB 스키마/필드는 **항상 MCP로 직접 확인**하고 확정한다.
- 멘토 API는 **로그인 사용자(mentor)** 기준으로 동작해야 한다.
  - 현 구조가 `menteeId`를 쿼리로 받는 방식이므로, 멘토는 `mentorId`를 파라미터로 받는 임시 방식과 **Auth 기반 최종 방식**을 분리해서 설계한다.

---

## 현황 요약
- 멘티 API는 구현되어 있으나 **멘토 API는 전무**.
  - 존재하는 API: `src/app/api/mentee/**`, `src/app/api/subjects/route.ts`
  - 멘토 화면은 대부분 **mock 데이터** 사용.
- 멘토 관련 저장 로직은 `mentor_tasks`, `task_submissions`, `task_feedback` 등 일부 테이블에만 존재.
- 멘토 대시보드/학생관리/피드백/자료실/신청서/일정/채팅/라이브는 **DB 접근과 API 모두 필요**.

---

## 우선순위 요약 (Mentor)

### Phase 0 — 공통 기반(권한/매칭/멘토 프로필)
- 목적: 모든 멘토 API 공통 분모 고정
- 대상: `profiles`, `mentor_mentee`, (mentor profile 확장 테이블 여부 확인)
- 결과:
  - 멘토 인증 방식 확정 (session 기반 권한 체크)
  - 멘토-멘티 매칭 조회 API 구축
  - 공통 validator/에러 규칙 확정

### Phase 1 — 피드백 루프(멘토 과제 리뷰)
- 대상 화면: `src/app/(mentor)/mentor/feedback/page.tsx`
- 핵심 기능:
  - 제출물 리스트 조회
  - 피드백 작성/등록
  - 과제 상태 전이(`pending` → `submitted` → `feedback_completed`)
- 이유: 멘토 UX 핵심 루프

### Phase 2 — 학생 목록/상세 대시보드(읽기 중심)
- 대상 화면: `src/app/(mentor)/mentor/page.tsx`, `students/*`, `mentees/[id]`
- 핵심 기능: 멘티 리스트 + 요약/통계/활동 로그 조회
- 이유: 멘토가 가장 빈번하게 접속하는 화면

### Phase 3 — 일정/세션
- 대상 화면: `src/app/(mentor)/mentor/schedule/page.tsx`, `sessions/[id]`
- 핵심 기능: 멘토 일정 CRUD, 세션 리뷰 저장

### Phase 4 — 신청서/자료실
- 대상 화면: `applications/page.tsx`, `library/page.tsx`
- 핵심 기능: 신청서 승인/반려, 자료 업로드/폴더/다운로드 카운트

### Phase 5 — 실시간 기능(채팅/라이브)
- 대상 화면: `chat/page.tsx`, `live/*`
- 핵심 기능: 메시지/라이브 세션 관리 + Realtime

---

## 화면별 요구사항 → 필요한 API/DB 매핑

### 1) 멘토 대시보드 `/mentor` (`src/app/(mentor)/mentor/page.tsx`)
- 필요한 데이터
  - 멘토 프로필(이름/사진)
  - 요약 통계: `활동 중인 학생 수`, `피드백 수`, `검토 학습 시간`
  - 담당 학생 리스트(멘티 프로필 + 상태 + 마지막 활동)
- 추천 API
  - `GET /api/mentor/dashboard`
- 필요한 DB 접근
  - `mentor_mentee` + `profiles`(멘티 프로필)
  - `mentor_tasks` + `task_feedback`(피드백 카운트)
  - `daily_records`(학습 시간 합산)
- 추가 메모
  - `status`/`lastActive`는 실제 활동 로그 기준으로 파생해야 함

### 2) 학생 목록 `/mentor/students` (`src/app/(mentor)/mentor/students/page.tsx`)
- 필요한 데이터
  - 리스트: `id, name, email, grade, attendance, lastActive, status, avatar, progress`
- 추천 API
  - `GET /api/mentor/mentees?search=...`
- 필요한 DB 접근
  - `mentor_mentee` → mentee list
  - `profiles` → name/email/avatar
  - `daily_records` → attendance(출석률), lastActive
  - `mentor_tasks` → 진행률(progress) 집계
- 추가 메모
  - `grade`, `track` 등은 멘티 상세 테이블(있다면)에서 가져와야 함

### 3) 학생 상세 `/mentor/students/[id]`
- 필요한 데이터
  - 프로필/연락처/메모
  - 주간 학습 시간, 완료 과제, 취약 과목
  - Heatmap(`date, count`) / 최근 활동 로그
- 추천 API
  - `GET /api/mentor/mentees/:id/overview`
  - `GET /api/mentor/mentees/:id/heatmap?from&to`
  - `GET /api/mentor/mentees/:id/activity?limit=...`
  - `PATCH /api/mentor/mentees/:id/notes`
- 필요한 DB 접근
  - `daily_records` → heatmap, 학습 시간
  - `mentor_tasks` / `task_submissions` / `task_feedback` → 활동 로그
  - (멘티 노트 테이블 필요 여부 확인)

### 4) 멘티 상세 `/mentor/mentees/[id]`
- 학생 상세 페이지와 **중복**됨.
- 통합 여부 결정 후 API 재사용 권장.

### 5) 피드백 `/mentor/feedback`
- 필요한 데이터
  - 제출 리스트(과제/자율/질문 타입), 이미지, 상태, 멘티 정보
  - 선택 항목 상세 + 피드백 작성
- 추천 API
  - `GET /api/mentor/submissions?status=pending&types=...`
  - `POST /api/mentor/tasks/:taskId/feedback`
- 필요한 DB 접근
  - `mentor_tasks` + `task_submissions` + `task_feedback`
  - 제출 이미지/첨부 파일용 테이블 필요 여부 확인
- 추가 메모
  - `type: homework/planner/question` 매핑 기준을 DB에서 정의해야 함

### 6) 일정 `/mentor/schedule`
- 필요한 데이터
  - 월별 이벤트 리스트 + 생성/수정/삭제
- 추천 API
  - `GET /api/mentor/schedule?from&to`
  - `POST /api/mentor/schedule`
  - `PATCH /api/mentor/schedule/:id`
  - `DELETE /api/mentor/schedule/:id`
- 필요한 DB 접근
  - `mentor_schedule_events` (없으면 신규)
  - 최소 필드: `mentor_id, mentee_id?, title, start_at, end_at, type`

### 7) 세션 상세 `/mentor/sessions/[id]`
- 필요한 데이터
  - 세션 정보(과목/시간/상태), proof 이미지, 리뷰(평점/코멘트)
- 추천 API
  - `GET /api/mentor/sessions/:id`
  - `POST /api/mentor/sessions/:id/review`
- 필요한 DB 접근
  - `sessions`, `session_proofs`, `session_reviews` 테이블 여부 확인

### 8) 신청서 `/mentor/applications`
- 필요한 데이터
  - 신청 리스트 + 상세 + 승인/반려
- 추천 API
  - `GET /api/mentor/applications`
  - `PATCH /api/mentor/applications/:id` (status 변경)
- 필요한 DB 접근
  - `mentor_applications` (없으면 신규)
  - 승인 시 `mentor_mentee` 레코드 생성

### 9) 자료실 `/mentor/library`
- 필요한 데이터
  - 폴더/파일 리스트 + 업로드/삭제/다운로드 카운트
- 추천 API
  - `GET /api/mentor/library?parentId=...&q=...`
  - `POST /api/mentor/library/folders`
  - `POST /api/mentor/library/files` (signed URL)
  - `DELETE /api/mentor/library/items/:id`
- 필요한 DB 접근
  - `library_items`(폴더/파일 통합) 또는 `library_files`/`library_folders`
  - Supabase Storage bucket 연결

### 10) 채팅 `/mentor/chat`
- 필요한 데이터
  - 채팅방 리스트 + 최근 메시지 + 읽지 않은 수
  - 메시지 읽기/전송
- 추천 API
  - `GET /api/mentor/chat/rooms`
  - `GET /api/mentor/chat/rooms/:id/messages`
  - `POST /api/mentor/chat/rooms/:id/messages`
- 필요한 DB 접근
  - `chat_rooms`, `chat_messages`, `chat_members`
  - Realtime 정책/인덱스/읽음 처리 정의 필요

### 11) 라이브 `/mentor/live`
- 필요한 데이터
  - 세션 목록, 시작/종료, 참여자
- 추천 API
  - `GET /api/mentor/live/sessions`
  - `POST /api/mentor/live/sessions`
  - `PATCH /api/mentor/live/sessions/:id`
- 필요한 DB 접근
  - `live_sessions`, `live_session_participants` (없으면 신규)

### 12) 설정 `/mentor/settings`
- 필요한 데이터
  - 멘토 프로필(대학/학과, 한줄소개, 태그, 상세 소개)
- 추천 API
  - `GET /api/mentor/profile`
  - `PATCH /api/mentor/profile`
- 필요한 DB 접근
  - `profiles`에 필드 확장 혹은 `mentor_profiles`, `mentor_profile_tags` 확인

---

## DB/Repository 작업 목록 (세밀)

### 공통
- `getProfileById` 외 **멘토 전용 조회** 필요
  - 예: `getMentorProfile(mentorId)`
- `mentor_mentee` 기반 **멘티 리스트 조회/카운트** 함수 추가
  - `listMenteesByMentorId(mentorId)`

### 멘토 과제/피드백
- `mentor_tasks` 조회 (멘토 기준)
  - `listMentorTasksByMentorId(mentorId, filters?)`
  - `listMentorTasksByMenteeId`는 기존 사용 유지
- `task_submissions` 조회 확장
  - `listTaskSubmissionsByMentorId(mentorId, filters?)` 필요
- `task_feedback` 생성
  - `createTaskFeedback(taskId, mentorId, comment, rating, status)`
  - 현재는 조회만 있음

### 활동/통계
- `daily_records` → `sum(study_time_min)`/`count(distinct date)` 집계용 함수
- `mentor_tasks` → 완료/제출/미제출 집계용 함수
- Heatmap용 `date, count` 범위 조회 함수

### 신규 테이블 가능성
- `mentor_applications`
- `mentor_schedule_events`
- `mentor_notes`
- `library_items`
- `sessions`, `session_reviews`, `session_proofs`
- `chat_rooms`, `chat_messages`
- `live_sessions`

---

## Route/Service 작업 목록 (세밀)

### `src/app/api/mentor/*` 구조 제안
- `/api/mentor/dashboard`
- `/api/mentor/mentees`
- `/api/mentor/mentees/[id]/overview`
- `/api/mentor/mentees/[id]/heatmap`
- `/api/mentor/mentees/[id]/activity`
- `/api/mentor/mentees/[id]/notes`
- `/api/mentor/submissions`
- `/api/mentor/tasks/[taskId]/feedback`
- `/api/mentor/schedule`
- `/api/mentor/schedule/[id]`
- `/api/mentor/applications`
- `/api/mentor/applications/[id]`
- `/api/mentor/library`
- `/api/mentor/library/items/[id]`
- `/api/mentor/profile`
- (후순위) `/api/mentor/chat/*`, `/api/mentor/live/*`

---

## Validator 작업 목록 (Zod)
- `mentorIdQuerySchema` (임시)
- `menteeIdParamSchema` (멘토용)
- `dashboardQuerySchema` (기간 필터)
- `mentorFeedbackBodySchema` (comment/rating/status)
- `scheduleEventBodySchema` (title/start_at/end_at/type)
- `applicationStatusBodySchema` (accepted/rejected)
- `libraryItemCreateSchema` (folder/file)

---

## 추가 위험/결정 포인트
- **Auth 방식**: 멘토 API는 쿼리 파라미터가 아닌 세션 기반으로 통일 필요.
- **RLS**: 현재 RLS 비활성 상태라면, 멘토 권한 기준 정책 먼저 설계.
- **멘토/멘티 상세 필드**: `grade`, `track`, `goal` 등은 DB 스키마 확인 필요.
- **활동 로그의 정의**: `task_submissions`/`planner_tasks`/`daily_records` 어떤 기준으로 UI에 노출할지 규칙 합의 필요.
- **중복 화면**: `/mentor/students` vs `/mentor/mentees` 중 하나로 통합 추천.

---

## 진행 메모
- 날짜/결정 사항/리스크를 간단히 기록한다.
- 예: `2026-02-05: Mentor API 라우트 구조 확정`
