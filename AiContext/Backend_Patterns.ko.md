# 백엔드 패턴 (Next.js + Prisma + Supabase)

## 목표
Prisma의 장점을 최대화하면서, AI가 헷갈리지 않도록 역할이 분명하고 레퍼런스가 많은 구조를 사용한다.

## 추천 아키텍처 (패턴 A)
레이어드 구조:

1) Route Handlers (HTTP 전용)
- 위치: `app/api/**/route.ts`
- 책임:
  - 요청 파싱
  - 서비스 호출
  - 응답 반환
- 비즈니스 로직/DB 접근 금지

2) Services (비즈니스 로직)
- 위치: `src/services/**`
- 책임:
  - 유스케이스 조합
  - 권한 검증
  - 레포지토리 호출 조정

3) Repositories (Prisma 전용)
- 위치: `src/repositories/**`
- 책임:
  - Prisma 쿼리/트랜잭션
  - HTTP/요청 컨텍스트 금지

4) 공통 라이브러리
- `src/lib/prisma.ts`: PrismaClient 싱글톤
- `src/lib/validators/**`: Zod 입력 검증 스키마

## 이 패턴이 좋은 이유
- 역할 경계가 명확해 AI가 혼동할 여지가 적다.
- Prisma는 레포지토리에서만 사용되어 일관성이 높다.
- 테스트가 쉬움: 서비스는 로직, 레포지토리는 데이터, 라우트는 통합 테스트.
- 레퍼런스가 풍부한 전통적 레이어드 구조.

## Supabase Realtime 호환성
이 구조는 Supabase Realtime과 충돌하지 않는다.

원칙:
- CRUD는 Prisma (repository/service)로 처리.
- Realtime은 Supabase JS client로 구독.
- Supabase Realtime은 Postgres 변경을 스트리밍하므로, Prisma 변경도 이벤트로 전파된다.

## Realtime 대비 최소 준비 (초기에 해두면 좋은 것)
나중에 리팩터링을 줄이기 위한 최소 체크리스트:

1) RLS (Row-Level Security)
- Realtime도 RLS 정책을 따른다.
- 보안 정책을 초기에 설계.

2) 소유 키 컬럼
- `user_id` 또는 `tenant_id`로 구독 필터링 가능해야 함.

3) 타임스탬프
- `created_at`, `updated_at` 필수.

4) 인덱스
- 구독 필터에 쓰는 컬럼은 인덱스 필요.

5) 선택: Replica Identity
- 업데이트 시 이전 값이 필요하면 `REPLICA IDENTITY FULL` 설정.

## 정리
- 지금은 패턴 A로 시작.
- Realtime은 나중에 Supabase client만 추가하면 된다.
- 다만 RLS와 스키마 키는 초기에 준비하는 게 가장 안전하다.

