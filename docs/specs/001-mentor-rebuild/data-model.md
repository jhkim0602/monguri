# 데이터 모델(초안)

## 공통
### User
- id (uuid)
- role: mentor | mentee | admin
- name, email, phone, avatarUrl
- createdAt, updatedAt

### MentorProfile
- id, userId
- bio, subjects[], career, intro

### MenteeProfile
- id, userId
- school, grade, track, goal

## 과제/피드백
### TaskTemplate
- id, mentorId
- title, description, subject, difficulty
- estimatedMinutes, attachments[]

### TaskAssignment
- id, taskTemplateId, menteeId
- dueDate, startTime, endTime
- status: pending | submitted | feedback_completed | overdue
- createdAt, updatedAt

### Submission
- id, taskAssignmentId, menteeId
- content, attachments[]
- submittedAt

### Feedback
- id, submissionId, mentorId
- comment, status: approved | revise
- createdAt

## 플래너/캘린더
### PlannerDay
- id, menteeId, date

### PlannerItem
- id, plannerDayId
- source: mentor_task | user_task | calendar_event
- title, subject
- startTime, endTime
- status: planned | done

### PlannerDayFeedback
- id, plannerDayId, mentorId
- summary, comment
- strengths[], nextSteps[]
- createdAt, updatedAt

### CalendarEvent
- id, menteeId
- title, startAt, endAt
- recurrenceRule (optional)
- source: custom | mentor_task | meeting

## 미팅
### Meeting
- id, mentorId, menteeId
- status: requested | scheduled | completed | canceled
- scheduledAt, durationMinutes
- notes, meetingLink

## 칼럼/콘텐츠
### ColumnSeries
- id, title, description, themeClass

### ColumnArticle
- id, seriesId
- title, subtitle, authorName
- coverImageUrl, excerpt
- status: draft | published | scheduled
- publishedAt

### MentorPost (옵션)
- id, mentorId
- title, content, status
- visibility: all | group | mentee

## 코멘트/알림
### Comment
- id, authorId
- targetType: submission | planner_day | task
- targetId
- body, createdAt

### Notification
- id, recipientId
- type, title, body, readAt
