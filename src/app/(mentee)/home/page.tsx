"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import WeeklyCalendar from "@/components/mentee/planner/WeeklyCalendar";
import Header from "@/components/mentee/layout/Header";
import HomeTasks from "@/components/mentee/home/HomeTasks";
import { supabase } from "@/lib/supabaseClient";
import {
  adaptMentorTasksToUi,
  adaptPlanEventsToUi,
  adaptPlannerTasksToUi,
  adaptProfileToUi,
  type MentorTaskLike,
  type PlannerTaskLike,
  type ScheduleEventLike,
  type UiProfile,
} from "@/lib/menteeAdapters";
import {
  readMenteeHomeCache,
  writeMenteeHomeCache,
} from "@/lib/menteeHomeCache";
import { COLUMN_ARTICLES, COLUMN_SERIES } from "@/constants/mentee/columns";
import Link from "next/link";
import HomeProgress from "@/components/mentee/home/HomeProgress";

export default function Home() {
  // Default to Feb 2 2026 for demo context
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [mentorTasks, setMentorTasks] = useState<MentorTaskLike[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTaskLike[]>([]);
  const [planEvents, setPlanEvents] = useState<ScheduleEventLike[]>([]);
  const [profile, setProfile] = useState<UiProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const forceRefreshRef = useRef(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const scheduleEvents = useMemo<ScheduleEventLike[]>(() => {
    const events: ScheduleEventLike[] = [];

    mentorTasks.forEach((task) => {
      if (!task.deadline) return;
      events.push({
        id: String(task.id),
        title: task.title,
        date: task.deadline,
        categoryId: task.categoryId,
        taskType: "mentor",
      });
    });

    plannerTasks.forEach((task) => {
      if (!task.deadline) return;
      events.push({
        id: String(task.id),
        title: task.title,
        date: task.deadline,
        categoryId: task.categoryId,
        taskType: "user",
      });
    });

    planEvents.forEach((event) => {
      if (!event.date) return;
      events.push(event);
    });

    return events;
  }, [mentorTasks, plannerTasks, planEvents]);

  const targetProgress = mentorTasks.length
    ? Math.round(
        (mentorTasks.filter((t) => t.status !== "pending").length /
          mentorTasks.length) *
          100,
      )
    : 0;

  const toDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMonthRange = (date: Date) => {
    const fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      from: toDateString(fromDate),
      to: toDateString(toDate),
    };
  };

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 400;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      setAnimatedProgress(Math.floor(percentage * targetProgress));
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };
    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetProgress]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      forceRefreshRef.current = true;
      setRefreshTick((prev) => prev + 1);
    }, 250);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!isMounted) return;
      if (!user) {
        if (!hasLoadedRef.current) {
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
        return;
      }
      setUserId(user.id);
    };

    loadUser();

    return () => {
      isMounted = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`mentee-home:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mentor_tasks",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mentor_tasks",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "mentor_tasks",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "planner_tasks",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "planner_tasks",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "planner_tasks",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "weekly_schedule_events",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "weekly_schedule_events",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "weekly_schedule_events",
          filter: `mentee_id=eq.${userId}`,
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, scheduleRefresh]);

  useEffect(() => {
    let isMounted = true;
    if (!userId) return;

    const { from, to } = getMonthRange(selectedDate);
    const cacheKey = `${userId}:${from}:${to}`;
    const cached = readMenteeHomeCache(cacheKey);
    const forceRefresh = forceRefreshRef.current;
    if (forceRefreshRef.current) {
      forceRefreshRef.current = false;
    }

    if (cached) {
      setMentorTasks(cached.data.mentorTasks);
      setPlannerTasks(cached.data.plannerTasks);
      setPlanEvents(cached.data.planEvents);
      setProfile(cached.data.profile);
      if (!hasLoadedRef.current) {
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    }

    if (cached && !cached.stale && !forceRefresh) {
      return () => {
        isMounted = false;
      };
    }

    const load = async () => {
      if (!hasLoadedRef.current && !cached) {
        setIsLoading(true);
      }
      try {
        const [tasksRes, profileRes, plannerRes, overviewRes] =
          await Promise.all([
            fetch(`/api/mentee/tasks?menteeId=${userId}`),
            fetch(`/api/mentee/profile?profileId=${userId}`),
            fetch(
              `/api/mentee/planner/tasks?menteeId=${userId}&from=${from}&to=${to}`,
            ),
            fetch(
              `/api/mentee/planner/overview?menteeId=${userId}&from=${from}&to=${to}`,
            ),
          ]);

        const next: {
          mentorTasks: MentorTaskLike[];
          plannerTasks: PlannerTaskLike[];
          planEvents: ScheduleEventLike[];
          profile: UiProfile | null;
        } = {
          mentorTasks: [],
          plannerTasks: [],
          planEvents: [],
          profile: null,
        };

        if (tasksRes.ok) {
          const tasksJson = await tasksRes.json();
          if (Array.isArray(tasksJson.tasks)) {
            next.mentorTasks = adaptMentorTasksToUi(tasksJson.tasks);
          }
        }

        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          next.profile = adaptProfileToUi(profileJson.profile ?? null);
        }

        if (plannerRes.ok) {
          const plannerJson = await plannerRes.json();
          if (Array.isArray(plannerJson.tasks)) {
            next.plannerTasks = adaptPlannerTasksToUi(plannerJson.tasks);
          }
        }

        if (overviewRes.ok) {
          const overviewJson = await overviewRes.json();
          next.planEvents = adaptPlanEventsToUi(
            overviewJson.scheduleEvents ?? [],
          );
        }

        if (!isMounted) return;

        setMentorTasks(next.mentorTasks);
        setPlannerTasks(next.plannerTasks);
        setPlanEvents(next.planEvents);
        setProfile(next.profile);
        writeMenteeHomeCache(cacheKey, next);
      } finally {
        if (isMounted && !hasLoadedRef.current) {
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, userId, refreshTick]);

  if (isLoading || !profile) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="bg-white">
      <Header title="설스터디" />

      {/* Welcome Section */}
      <section className="px-6 flex justify-between items-start mb-6">
        <div>
          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold mb-2">
            {profile.role}
            {typeof profile.dDay === "number" ? (
              <span className="ml-1 text-primary">D-{profile.dDay}</span>
            ) : null}
          </span>
          <h2 className="text-xl font-bold leading-tight">
            {profile.name}님, <br />
            오늘도 화이팅! 🔥
          </h2>
        </div>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
          <img
            src={profile.avatar}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <HomeProgress
        animatedProgress={animatedProgress}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        mentorTasks={mentorTasks}
        scheduleEvents={scheduleEvents}
      />

      <section className="px-6 mb-6">
        <WeeklyCalendar
          currentDate={selectedDate}
          onDateSelect={setSelectedDate}
          scheduleEvents={scheduleEvents}
        />
      </section>

      <HomeTasks tasks={mentorTasks} />

      {/* SeolStudy Columns */}
      <section className="px-6 pb-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
              SeolStudy Column
            </p>
            <h3 className="text-lg font-black text-gray-900">
              [설스터디] 서울대쌤 칼럼
            </h3>
          </div>
          <Link
            href="/columns"
            className="text-[11px] font-black text-gray-400 hover:text-gray-700 transition-colors"
          >
            전체보기
          </Link>
        </div>

        <div className="space-y-8">
          {COLUMN_SERIES.map((series, seriesIndex) => {
            const seriesArticles = COLUMN_ARTICLES.filter(
              (article) => article.seriesId === series.id,
            );
            return (
              <div key={series.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-gray-900">
                      {series.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {series.description}
                    </p>
                  </div>
                </div>

                {seriesArticles.length === 0 ? (
                  <div className="py-8 text-center text-xs font-bold text-gray-300 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                    준비 중인 칼럼이에요.
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {seriesArticles.map((article) => {
                      const isComingSoon = article.status !== "published";
                      const card = (
                        <div className="min-w-[220px] max-w-[220px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                          <div className="h-[120px] w-full overflow-hidden">
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className={`h-full w-full object-cover ${
                                isComingSoon ? "grayscale" : ""
                              }`}
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <span className="text-[10px] font-black text-gray-400">
                              {article.author}
                            </span>
                            <h5 className="text-sm font-black text-gray-900 line-clamp-2">
                              {article.title}
                            </h5>
                            <p className="text-[11px] text-gray-500 line-clamp-2">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                              <span>{article.date}</span>
                            </div>
                            {isComingSoon && (
                              <div className="text-[10px] font-black text-gray-300">
                                준비 중
                              </div>
                            )}
                          </div>
                        </div>
                      );

                      return isComingSoon ? (
                        <div key={article.slug} className="opacity-70">
                          {card}
                        </div>
                      ) : (
                        <Link
                          key={article.slug}
                          href={`/column/${article.slug}`}
                        >
                          {card}
                        </Link>
                      );
                    })}
                  </div>
                )}
                {seriesIndex < COLUMN_SERIES.length - 1 && (
                  <div className="border-b border-dashed border-gray-200 pt-6" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
