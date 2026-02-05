# Mentee 백엔드 우선순위 보고서

## 전제
- 아키텍처는 `Backend_Patterns.md`의 Pattern A를 따른다.
  - Route Handler: `app/api/**/route.ts` (HTTP만)
  - Service: `src/services/**` (비즈니스 로직)
  - Repository: `src/repositories/**` (Prisma 전용)
  - Validator: `src/lib/validators/**` (Zod)
- DB 스키마/필드는 **항상 MCP로 직접 확인**하고 확정한다.

---

## 우선순위 요약

### Phase 0 — 공통 기반(정체성/권한/프로필)
- 목적: 모든 API의 공통 분모를 먼저 고정
- 대상(예시): `profiles`, `mentee_profiles`, `mentor_mentee`, `subjects`
- 이유: 이후 모든 기능이 `user_id`/role/멘토-멘티 매칭에 의존

### Phase 1 — 멘토 과제 조회/요약 (읽기 중심)
- 대상 화면: 홈, 캘린더, 마이페이지 성취도
- 핵심 기능: 멘토 과제 리스트/상태/요약 조회
- 이유: UI 대부분이 “멘토 과제 진행률”에 의존

### Phase 2 — 과제 제출/피드백 사이클 (쓰기 포함)
- 대상 화면: 플래너, 과제 상세
- 핵심 기능: 제출, 피드백 상태 갱신, 멘토 코멘트 조회
- 이유: 핵심 루프(멘티 제출 → 멘토 피드백)를 안정화

### Phase 3 — 멘티 자율 플래너 CRUD
- 대상 화면: 플래너/캘린더
- 핵심 기능: 멘티 자율 과제/일정 CRUD
- 이유: 멘토 과제 기능 위에 자연스럽게 얹힘

### Phase 4 — 파일/첨부 (스토리지 연동)
- 대상 기능: 제출 사진, 첨부 자료
- 이유: 인증/RLS/권한 정책이 얽혀 있어 후순위가 안전

### Phase 5 — 고급/선택 기능
- 대상: 알림, 통계 집계, 리얼타임 구독
- 이유: 운영 가치가 높지만 핵심 기능 안정 후 진행

---

## 체크리스트 (진행 상황 기록용)

### Phase 0 — 공통 기반
- [x] MCP로 테이블/필드 확인
- [ ] RLS 정책 방향 확정
- [ ] RLS 적용을 위한 로그인 토큰을 HTTP ONLY 쿠키로 전달하는 방식 설계/적용
- [x] `profiles`/`mentee_profiles`/`mentor_mentee` 접근 로직 설계
- [x] 공통 유효성 검증 스키마 작성

### Phase 1 — 멘토 과제 조회/요약
- [x] MCP로 과제 관련 테이블/필드 확인
- [x] Repository: 조회 쿼리 정의
- [x] Service: 권한/매칭 검증 + 응답 조립
- [x] Route: API 설계 및 응답 스펙 확정
- [ ] UI 연동 시뮬레이션

### Phase 2 — 과제 제출/피드백 사이클
- [x] MCP로 제출/피드백 테이블 확인
- [x] 제출 API(작성) 구현
- [x] 피드백 조회 API 구현
- [x] 상태 전이 로직 정리
- [x] 기본 에러 케이스 정의

### Phase 3 — 멘티 자율 플래너 CRUD
- [x] MCP로 플래너/일정 테이블 확인
- [x] CRUD API 설계
- [x] 일/주/월 단위 조회 시나리오 검증

### Phase 4 — 파일/첨부 연동
- [ ] MCP로 파일 메타 테이블 확인
- [ ] 스토리지 업로드/다운로드 정책 확정
- [ ] 첨부/제출 파일 연결 API 구현

### Phase 5 — 고급/선택
- [ ] 알림 이벤트 정의
- [ ] 통계 집계 방식 확정
- [ ] 리얼타임 구독 범위 확정

---

## 진행 메모
- 날짜/결정 사항/리스크를 간단히 기록한다.
- 예: `2026-02-04: Phase 1 API 응답 포맷 확정`
- 2026-02-04: MCP로 `profiles`, `mentor_mentee`, `subjects`, `mentor_tasks`, `task_submissions`, `task_feedback` 테이블/필드 확인. `mentee_profiles` 테이블은 없음.
- 2026-02-04: Supabase RLS가 모든 테이블에서 비활성 상태라 정책 설계 필요.
- 2026-02-04: Phase 0/1 API 기본 구조(Route/Service/Repository/Validator) 구현 완료. (멘토-멘티 매칭 검증은 추후 강화)
- 2026-02-04: Phase 2 제출/피드백 API 구현 및 상태 전이/에러 처리 정리 완료.
- 2026-02-04: `subjects`를 `uuid + slug + color_hex/text_color_hex` 구조로 정규화하고, 관련 FK/응답 포맷을 갱신.
- 2026-02-05: Phase 3 플래너 CRUD 및 캘린더 연동 검증 완료. (Mock -> API 전환 확인, UI/API 정상)
