# Monguri DB 테이블 구조 (Supabase / public schema)
작성일: 2026-02-08

## 개요
- 스키마: `public`
- 테이블 수: 21

## ENUM 정의
- `user_role`: `mentor`, `mentee`, `admin`
- `mentor_mentee_status`: `active`, `inactive`
- `task_status`: `pending`, `submitted`, `feedback_completed`
- `feedback_status`: `pending`, `reviewed`
- `mood_status`: `best`, `good`, `normal`, `bad`, `worst`
- `meeting_status`: `PENDING`, `CONFIRMED`, `REJECTED`

## 테이블 상세

### profiles
- RLS: 비활성화
- 행 수(조회 시점): 5
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N| | |
|`role`|user_role|N|`'mentee'::user_role`|ENUM|
|`name`|text|Y| | |
|`avatar_url`|text|Y| | |
|`intro`|text|Y| | |
|`created_at`|timestamptz|N|`now()`| |
- 외래키
`public.profiles.id` → `auth.users.id`
`public.weekly_schedule_events.mentee_id` → `public.profiles.id`
`public.mentor_mentee.mentor_id` → `public.profiles.id`
`public.mentor_mentee.mentee_id` → `public.profiles.id`
`public.mentor_tasks.mentor_id` → `public.profiles.id`
`public.mentor_tasks.mentee_id` → `public.profiles.id`
`public.task_submissions.mentee_id` → `public.profiles.id`
`public.task_feedback.mentor_id` → `public.profiles.id`
`public.planner_tasks.mentee_id` → `public.profiles.id`
`public.study_records.mentee_id` → `public.profiles.id`
`public.daily_records.mentee_id` → `public.profiles.id`
`public.chat_messages.sender_id` → `public.profiles.id`
`public.files.uploader_id` → `public.profiles.id`
`public.planner_task_submissions.mentee_id` → `public.profiles.id`

### mentor_mentee
- RLS: 비활성화
- 행 수(조회 시점): 4
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentor_id`|uuid|N| | |
|`mentee_id`|uuid|N| | UNIQUE|
|`status`|mentor_mentee_status|N|`'active'::mentor_mentee_status`|ENUM|
|`started_at`|timestamptz|N|`now()`| |
- 외래키
`public.mentor_mentee.mentor_id` → `public.profiles.id`
`public.mentor_mentee.mentee_id` → `public.profiles.id`
`public.meeting_requests.mentor_mentee_id` → `public.mentor_mentee.id`
`public.chat_messages.mentor_mentee_id` → `public.mentor_mentee.id`

### subjects
- RLS: 비활성화
- 행 수(조회 시점): 3
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N| | |
|`name`|text|N| | |
|`sort_order`|int4|Y| | |
|`slug`|text|N| | UNIQUE|
|`color_hex`|text|Y| | |
|`text_color_hex`|text|Y| | |
- 외래키
`public.weekly_schedule_events.subject_id` → `public.subjects.id`
`public.planner_tasks.subject_id` → `public.subjects.id`
`public.mentor_tasks.subject_id` → `public.subjects.id`

### mentor_tasks
- RLS: 비활성화
- 행 수(조회 시점): 6
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentor_id`|uuid|N| | |
|`mentee_id`|uuid|N| | |
|`subject_id`|uuid|Y| | |
|`title`|text|N| | |
|`description`|text|Y| | |
|`status`|task_status|N|`'pending'::task_status`|ENUM|
|`deadline`|date|Y| | |
|`badge_color`|text|Y| | |
|`created_at`|timestamptz|N|`now()`| |
|`is_mentor_task`|bool|Y|`false`| |
|`materials`|jsonb|Y|`'[]'::jsonb`| |
- 외래키
`public.mentor_task_materials.task_id` → `public.mentor_tasks.id`
`public.mentor_tasks.subject_id` → `public.subjects.id`
`public.study_records.task_id` → `public.mentor_tasks.id`
`public.task_feedback.task_id` → `public.mentor_tasks.id`
`public.task_submissions.task_id` → `public.mentor_tasks.id`
`public.mentor_tasks.mentee_id` → `public.profiles.id`
`public.mentor_tasks.mentor_id` → `public.profiles.id`

### task_submissions
- RLS: 비활성화
- 행 수(조회 시점): 5
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`task_id`|uuid|N| | |
|`mentee_id`|uuid|N| | |
|`submitted_at`|timestamptz|N|`now()`| |
|`note`|text|Y| | |
- 외래키
`public.task_submission_files.submission_id` → `public.task_submissions.id`
`public.task_submissions.task_id` → `public.mentor_tasks.id`
`public.task_submissions.mentee_id` → `public.profiles.id`

### task_feedback
- RLS: 비활성화
- 행 수(조회 시점): 4
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`task_id`|uuid|N| | |
|`mentor_id`|uuid|N| | |
|`comment`|text|Y| | |
|`rating`|int4|Y| | |
|`status`|feedback_status|N|`'pending'::feedback_status`|ENUM|
|`created_at`|timestamptz|N|`now()`| |
- 외래키
`public.task_feedback.mentor_id` → `public.profiles.id`
`public.task_feedback.task_id` → `public.mentor_tasks.id`

### planner_tasks
- RLS: 비활성화
- 행 수(조회 시점): 16
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentee_id`|uuid|N| | |
|`subject_id`|uuid|Y| | |
|`title`|text|N| | |
|`date`|date|N| | |
|`completed`|bool|N|`false`| |
|`time_spent_sec`|int4|Y| | |
|`created_at`|timestamptz|N|`now()`| |
|`start_time`|text|Y| | |
|`end_time`|text|Y| | |
|`recurring_group_id`|uuid|Y| | |
|`mentor_comment`|text|Y| | |
|`is_mentor_task`|bool|Y|`false`| |
|`description`|text|Y| | |
|`materials`|jsonb|Y|`'[]'::jsonb`| |
- 외래키
`public.planner_tasks.mentee_id` → `public.profiles.id`
`public.planner_tasks.subject_id` → `public.subjects.id`
`public.planner_tasks.recurring_group_id` → `public.planner_recurring_groups.id`
`public.planner_task_submissions.task_id` → `public.planner_tasks.id`

### notifications
- RLS: 비활성화
- 행 수(조회 시점): 0
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`recipient_id`|uuid|N| | |
|`recipient_role`|user_role|N|`'mentee'::user_role`|ENUM|
|`type`|text|N| | |
|`ref_type`|text|Y| | |
|`ref_id`|uuid|Y| | |
|`title`|text|N| | |
|`message`|text|N| | |
|`action_url`|text|Y| | |
|`actor_id`|uuid|Y| | |
|`avatar_url`|text|Y| | |
|`meta`|jsonb|N|`'{}'::jsonb`| |
|`created_at`|timestamptz|N|`now()`| |
|`read_at`|timestamptz|Y| | |
- 외래키
`public.notifications.recipient_id` → `public.profiles.id`
`public.notifications.actor_id` → `public.profiles.id`

### study_records
- RLS: 비활성화
- 행 수(조회 시점): 0
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentee_id`|uuid|N| | |
|`task_id`|uuid|Y| | |
|`note`|text|Y| | |
|`created_at`|timestamptz|N|`now()`| |
- 외래키
`public.study_records.task_id` → `public.mentor_tasks.id`
`public.study_records.mentee_id` → `public.profiles.id`

### weekly_schedule_events
- RLS: 비활성화
- 행 수(조회 시점): 0
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentee_id`|uuid|N| | |
|`subject_id`|uuid|Y| | |
|`title`|text|N| | |
|`date`|date|N| | |
- 외래키
`public.weekly_schedule_events.subject_id` → `public.subjects.id`
`public.weekly_schedule_events.mentee_id` → `public.profiles.id`

### daily_records
- RLS: 비활성화
- 행 수(조회 시점): 2
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentee_id`|uuid|N| | |
|`date`|date|N| | |
|`study_time_min`|int4|N|`0`| |
|`mood`|mood_status|Y| |ENUM|
- 외래키
`public.daily_records.mentee_id` → `public.profiles.id`

### planner_recurring_groups
- RLS: 비활성화
- 행 수(조회 시점): 4
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentee_id`|uuid|N| | |
|`recurrence_rule`|jsonb|Y| | |
|`created_at`|timestamptz|Y|`now()`| |
|`updated_at`|timestamptz|Y|`now()`| |
- 외래키
`public.planner_tasks.recurring_group_id` → `public.planner_recurring_groups.id`
`public.planner_recurring_groups.mentee_id` → `auth.users.id`

### chat_messages
- RLS: 활성화
- 행 수(조회 시점): 42
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentor_mentee_id`|uuid|N| | |
|`sender_id`|uuid|N| | |
|`body`|text|Y| | |
|`message_type`|text|N|`'text'::text`| |
|`created_at`|timestamptz|N|`now()`| |
- 외래키
`public.chat_attachments.message_id` → `public.chat_messages.id`
`public.chat_messages.sender_id` → `public.profiles.id`
`public.chat_messages.mentor_mentee_id` → `public.mentor_mentee.id`

### chat_attachments
- RLS: 활성화
- 행 수(조회 시점): 1
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`message_id`|uuid|N| | |
|`bucket`|text|N|`'chat-attachments'::text`| |
|`path`|text|N| | |
|`mime_type`|text|Y| | |
|`size_bytes`|int8|Y| |CHECK: size_bytes IS NULL OR size_bytes >= 0|
|`width`|int4|Y| | |
|`height`|int4|Y| | |
|`created_at`|timestamptz|N|`now()`| |
- 외래키
`public.chat_attachments.message_id` → `public.chat_messages.id`

### mentor_materials
- RLS: 비활성화
- 행 수(조회 시점): 7
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentor_id`|uuid|Y| | |
|`title`|text|N| | |
|`type`|text|Y|`'link'::text`| |
|`url`|text|Y| | |
|`created_at`|timestamptz|N|`timezone('utc'::text, now())`| |
|`file_id`|uuid|Y| | |
|`archived_at`|timestamptz|Y| | |
- 외래키
`public.mentor_materials.file_id` → `public.files.id`
`public.mentor_task_materials.source_material_id` → `public.mentor_materials.id`

### files
- RLS: 비활성화
- 행 수(조회 시점): 10
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`bucket`|text|N| | |
|`path`|text|N| | |
|`original_name`|text|N| | |
|`mime_type`|text|N| | |
|`size_bytes`|int8|N| | |
|`uploader_id`|uuid|Y| | |
|`checksum`|text|Y| | |
|`created_at`|timestamptz|N|`now()`| |
|`deleted_at`|timestamptz|Y| | |
- 외래키
`public.files.uploader_id` → `public.profiles.id`
`public.mentor_materials.file_id` → `public.files.id`
`public.mentor_task_materials.file_id` → `public.files.id`
`public.task_submission_files.file_id` → `public.files.id`
`public.planner_task_submission_files.file_id` → `public.files.id`

### mentor_task_materials
- RLS: 비활성화
- 행 수(조회 시점): 4
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`task_id`|uuid|N| | |
|`file_id`|uuid|N| | |
|`source_material_id`|uuid|Y| | |
|`sort_order`|int4|N|`0`| |
|`created_at`|timestamptz|N|`now()`| |
- 외래키
`public.mentor_task_materials.task_id` → `public.mentor_tasks.id`
`public.mentor_task_materials.file_id` → `public.files.id`
`public.mentor_task_materials.source_material_id` → `public.mentor_materials.id`

### task_submission_files
- RLS: 비활성화
- 행 수(조회 시점): 2
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`submission_id`|uuid|N| | |
|`file_id`|uuid|N| | |
|`created_at`|timestamptz|N|`now()`| |
- 외래키
`public.task_submission_files.submission_id` → `public.task_submissions.id`
`public.task_submission_files.file_id` → `public.files.id`

### planner_task_submissions
- RLS: 비활성화
- 행 수(조회 시점): 0
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`task_id`|uuid|N| | |
|`mentee_id`|uuid|N| | |
|`note`|text|Y| | |
|`submitted_at`|timestamptz|N|`now()`| |
- 외래키
`public.planner_task_submissions.task_id` → `public.planner_tasks.id`
`public.planner_task_submissions.mentee_id` → `public.profiles.id`
`public.planner_task_submission_files.submission_id` → `public.planner_task_submissions.id`

### planner_task_submission_files
- RLS: 비활성화
- 행 수(조회 시점): 0
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`submission_id`|uuid|N| | |
|`file_id`|uuid|N| | |
|`created_at`|timestamptz|N|`now()`| |
- 외래키
`public.planner_task_submission_files.submission_id` → `public.planner_task_submissions.id`
`public.planner_task_submission_files.file_id` → `public.files.id`

### meeting_requests
- RLS: 활성화
- 행 수(조회 시점): 76
- 기본키: `id`
- 컬럼
|컬럼|타입|NULL|기본값|비고|
|---|---|---|---|---|
|`id`|uuid|N|`gen_random_uuid()`| |
|`mentor_mentee_id`|uuid|N| | |
|`requestor_id`|uuid|N| | |
|`topic`|text|N| | |
|`preferred_times`|jsonb|N| | |
|`confirmed_time`|timestamptz|Y| | |
|`status`|meeting_status|N|`'PENDING'::meeting_status`|ENUM|
|`zoom_link`|text|Y| | |
|`created_at`|timestamptz|N|`timezone('utc'::text, now())`| |
- 외래키
`public.meeting_requests.mentor_mentee_id` → `public.mentor_mentee.id`
`public.meeting_requests.requestor_id` → `auth.users.id`
