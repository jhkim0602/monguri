"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import PlannerDetailView from "@/components/mentee/calendar/PlannerDetailView";
import { supabase } from "@/lib/supabaseClient";
import {
  adaptDailyRecordsToUi,
  adaptMentorTasksToUi,
  adaptPlanEventsToUi,
  adaptPlannerTasksToUi,
  type DailyRecordLike,
  type MentorTaskLike,
  type PlannerTaskLike,
  type ScheduleEventLike,
} from "@/lib/menteeAdapters";

const pad2 = (value: number) => String(value).padStart(2, "0");
const formatDateInput = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export default function FeedbackCollectionPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menteeId, setMenteeId] = useState<string | null>(null);
  const [mentorTasks, setMentorTasks] = useState<MentorTaskLike[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTaskLike[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEventLike[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecordLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    if (!dateParam) return;
    const parsed = parseDateInput(dateParam);
    if (!Number.isNaN(parsed.getTime())) {
      setCurrentDate(parsed);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id ?? null;
      if (!isMounted) return;
      setMenteeId(userId);
      if (!userId) setIsLoading(false);
    };
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!menteeId) return;

    const from = formatDateInput(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    );
    const to = formatDateInput(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    );

    const load = async () => {
      setIsLoading(true);
      try {
        const [mentorTaskRes, plannerTaskRes, overviewRes] = await Promise.all([
          fetch(`/api/mentee/tasks?menteeId=${menteeId}`),
          fetch(`/api/mentee/planner/tasks?menteeId=${menteeId}&from=${from}&to=${to}`),
          fetch(
            `/api/mentee/planner/overview?menteeId=${menteeId}&from=${from}&to=${to}`,
          ),
        ]);

        const nextMentorTasks = mentorTaskRes.ok
          ? adaptMentorTasksToUi((await mentorTaskRes.json()).tasks ?? [])
          : [];
        const nextPlannerTasks = plannerTaskRes.ok
          ? adaptPlannerTasksToUi((await plannerTaskRes.json()).tasks ?? [])
          : [];
        const overviewJson = overviewRes.ok ? await overviewRes.json() : null;
        const nextScheduleEvents = overviewJson
          ? adaptPlanEventsToUi(overviewJson.scheduleEvents ?? [])
          : [];
        const nextDailyRecords = overviewJson
          ? adaptDailyRecordsToUi(overviewJson.dailyRecords ?? [])
          : [];

        if (!isMounted) return;
        setMentorTasks(nextMentorTasks);
        setPlannerTasks(nextPlannerTasks);
        setScheduleEvents(nextScheduleEvents);
        setDailyRecords(nextDailyRecords);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [currentDate, menteeId]);

  const mentorDeadlinesForSelected = useMemo(
    () =>
      mentorTasks.filter(
        (task) => task.deadline && isSameDay(task.deadline, currentDate),
      ),
    [mentorTasks, currentDate],
  );
  const userTasksForSelected = useMemo(
    () =>
      plannerTasks.filter(
        (task) => task.deadline && isSameDay(task.deadline, currentDate),
      ),
    [plannerTasks, currentDate],
  );
  const dailyEventsForSelected = useMemo(
    () =>
      scheduleEvents.filter(
        (event) => event.date && isSameDay(event.date, currentDate),
      ),
    [scheduleEvents, currentDate],
  );
  const dailyRecordForSelected = useMemo(
    () =>
      dailyRecords.find(
        (record) => record.date && isSameDay(record.date, currentDate),
      ) ?? null,
    [dailyRecords, currentDate],
  );

  const plannerSummary = useMemo(() => {
    const total =
      mentorDeadlinesForSelected.length +
      userTasksForSelected.length +
      dailyEventsForSelected.length;
    const doneMentor = mentorDeadlinesForSelected.filter(
      (task) => task.status === "submitted" || task.status === "feedback_completed",
    ).length;
    const donePlanner = userTasksForSelected.filter((task) => task.completed).length;
    const completed = doneMentor + donePlanner;
    return {
      total,
      completed,
      mentorReply: dailyRecordForSelected?.mentorReply ?? null,
    };
  }, [
    mentorDeadlinesForSelected,
    userTasksForSelected,
    dailyEventsForSelected,
    dailyRecordForSelected?.mentorReply,
  ]);

  const dateLabel = currentDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100/60 bg-white px-6 pb-5 pt-12">
        <button
          type="button"
          onClick={() => router.push("/mypage")}
          className="-ml-2 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
          aria-label="마이페이지로 돌아가기"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-[18px] font-black text-gray-900">피드백 모아보기</h1>
          <p className="mt-0.5 text-[10px] font-bold text-gray-400">
            Planner Feedback Review
          </p>
        </div>
      </header>

      <section className="border-b border-gray-100 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevDay}
            className="rounded-full bg-gray-100 p-2 text-gray-400 transition-colors hover:text-gray-700"
            aria-label="이전 날짜"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-[13px] font-black text-gray-900">{dateLabel}</div>
          <button
            type="button"
            onClick={handleNextDay}
            className="rounded-full bg-gray-100 p-2 text-gray-400 transition-colors hover:text-gray-700"
            aria-label="다음 날짜"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      <section className="space-y-6 px-6 py-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-[16px] font-black text-gray-900">완성된 플래너</h2>
            <p className="mt-1 text-[11px] font-medium text-gray-400">
              실제 DB 데이터 기준으로 생성된 플래너 상세입니다.
            </p>
          </div>
          <div className="flex justify-center">
            <PlannerDetailView
              date={currentDate}
              dailyRecord={dailyRecordForSelected}
              mentorDeadlines={mentorDeadlinesForSelected}
              userTasks={userTasksForSelected}
              dailyEvents={dailyEventsForSelected}
              size="page"
            />
          </div>
        </div>

        <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">오늘의 종합 피드백</h3>
              <p className="mt-0.5 text-[10px] font-bold text-gray-400">
                플래너 전체에 대한 멘토 리뷰
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-[12px] font-medium text-gray-400">
              데이터를 불러오는 중입니다.
            </div>
          ) : !plannerSummary.mentorReply ? (
            <div className="py-10 text-center text-[12px] font-medium text-gray-400">
              아직 종합 피드백이 등록되지 않았습니다.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-[11px] font-black text-gray-500">요약</p>
                <p className="text-[13px] font-medium leading-relaxed text-gray-700">
                  오늘 학습 항목 {plannerSummary.total}개 중 {plannerSummary.completed}
                  개를 완료했습니다.
                </p>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-black text-gray-500">멘토 코멘트</p>
                <p className="text-[13px] font-medium leading-relaxed text-gray-700">
                  {plannerSummary.mentorReply}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
