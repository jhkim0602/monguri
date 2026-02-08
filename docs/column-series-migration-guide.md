# Column Series Migration Guide (Planned, Not Executed)

이 문서는 `src/constants/mentee/columns.ts`의 `COLUMN_SERIES`를 DB/API로 이전하기 위한 가이드입니다.

현재 턴에서는 **마이그레이션을 실행하지 않습니다.**  
이번 턴에서 한 작업은 다음 두 가지입니다.
- `COLUMN_SERIES`는 유지
- 미사용 mock 데이터(`COLUMN_ARTICLES`) 제거

## 1. 목표
- 프론트 하드코딩 시리즈(`COLUMN_SERIES`) 제거
- DB에서 시리즈 목록을 관리
- 멘티/멘토 컬럼 화면에서 동일한 UI 동작 유지

## 2. 현재 사용처
- `src/app/(mentee)/columns/page.tsx`
- `src/app/(mentee)/home/page.tsx`
- `src/app/(mentor)/mentor/columns/new/page.tsx`
- `src/app/(mentor)/mentor/columns/[id]/edit/page.tsx`

## 3. 권장 DB 스키마
기존 `columns.series_id`와 자연스럽게 연결되는 테이블:

```sql
create table if not exists column_series (
  id text primary key,               -- 예: 'habit', 'study'
  title text not null,
  description text not null,
  theme_class text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_column_series_active_order
  on column_series (is_active, sort_order);
```

초기 데이터 시드(현재 상수 기준):

```sql
insert into column_series (id, title, description, theme_class, sort_order)
values
  ('habit', '생활 습관&동기부여', '공부 루틴을 만드는 작고 확실한 습관', 'bg-amber-50 text-amber-700', 10),
  ('study', '서울대쌤들의 국영수 공부법', '과목별 최적 루틴과 실전 노하우', 'bg-blue-50 text-blue-700', 20)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  theme_class = excluded.theme_class,
  sort_order = excluded.sort_order,
  is_active = true;
```

## 4. API 설계 권장안
새 API 예시:
- `GET /api/column-series`  
  응답: `[{ id, title, description, themeClass, sortOrder }]`

서버 매핑 규칙:
- `theme_class` -> `themeClass`

## 5. 프론트 교체 순서
1. `src/app/(mentee)/columns/page.tsx`에서 `COLUMN_SERIES` import 제거 -> API fetch
2. `src/app/(mentee)/home/page.tsx`에서 `COLUMN_SERIES` import 제거 -> API fetch
3. `src/app/(mentor)/mentor/columns/new/page.tsx`에서 시리즈 select를 API 데이터로 교체
4. `src/app/(mentor)/mentor/columns/[id]/edit/page.tsx`에서 동일 교체
5. 모든 화면 확인 후 `src/constants/mentee/columns.ts`에서 `COLUMN_SERIES` 제거

## 6. 롤아웃 전략
- 1단계: API 우선 도입 + 상수 fallback 유지
- 2단계: API 안정성 확인 후 fallback 제거
- 3단계: 상수 파일 삭제

## 7. 검증 체크리스트
- 멘티 칼럼 페이지 시리즈 필터 정상 동작
- 멘티 홈 칼럼 섹션 시리즈 그룹 정상 렌더링
- 멘토 칼럼 작성/수정 시 시리즈 선택 정상 동작
- 타입체크/빌드 통과

