"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { MessageCircle } from "lucide-react";
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
import { COLUMN_SERIES } from "@/constants/mentee/columns";
import Link from "next/link";
import HomeProgress from "@/components/mentee/home/HomeProgress";
import { NotificationBadge } from "@/components/ui";

export default function Home() {
  // Default to Feb 2 2026 for demo context
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [mentorTasks, setMentorTasks] = useState<MentorTaskLike[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTaskLike[]>([]);
  const [planEvents, setPlanEvents] = useState<ScheduleEventLike[]>([]);
  const [profile, setProfile] = useState<UiProfile | null>(null);
  const [columns, setColumns] = useState<any[]>([]); // Use flexible type for now or define proper interface
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
        colorHex: task.badgeColor?.bg,
        textColorHex: task.badgeColor?.text,
        subjectName: task.subject,
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
        colorHex: task.badgeColor?.bg,
        textColorHex: task.badgeColor?.text,
        subjectName: task.subject,
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
      setColumns(cached.data.columns ?? []);
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

        // Fetch Columns directly from Supabase - simplified query
        const { data: columnsData, error: columnsError } = await supabase
          .from("columns")
          .select("id, title, subtitle, slug, series_id, cover_image_url, created_at, published_at, author_id")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (columnsError) {
          console.error("Error fetching columns:", columnsError);
        }

        if (isMounted) {
          if (columnsData && columnsData.length > 0) {
            setColumns(columnsData);
          } else {
            setColumns([]);
          }
        }

        const next: {
          mentorTasks: MentorTaskLike[];
          plannerTasks: PlannerTaskLike[];
          planEvents: ScheduleEventLike[];
          profile: UiProfile | null;
          columns: any[];
        } = {
          mentorTasks: [],
          plannerTasks: [],
          planEvents: [],
          profile: null,
          columns: [],
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

        next.columns = columnsData ?? [];

        setMentorTasks(next.mentorTasks);
        setPlannerTasks(next.plannerTasks);
        setPlanEvents(next.planEvents);
        setProfile(next.profile);
        setColumns(next.columns);
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

  const handleFeedbackRead = useCallback(
    (taskId: string, feedbackId?: string) => {
      setMentorTasks((prev) => {
        const next = prev.map((task) => {
          if (String(task.id) !== taskId) return task;
          if (feedbackId && task.latestFeedbackId && task.latestFeedbackId !== feedbackId) {
            return task;
          }
          return {
            ...task,
            feedbackIsRead: true,
            feedbackReadAt: new Date().toISOString(),
          };
        });

        if (userId) {
          const { from, to } = getMonthRange(selectedDate);
          const cacheKey = `${userId}:${from}:${to}`;
          const cached = readMenteeHomeCache(cacheKey);
          if (cached) {
            writeMenteeHomeCache(cacheKey, {
              ...cached.data,
              mentorTasks: next,
            });
          }
        }

        return next;
      });
    },
    [selectedDate, userId],
  );

  if (isLoading || !profile) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="bg-white">
      <Header
        title="설스터디"
        rightElement={
          <div className="flex gap-4 text-gray-400 items-center">
            <Link href="/chat" className="hover:text-primary transition-colors">
              <MessageCircle size={24} />
            </Link>
            <NotificationBadge iconSize={24} />
          </div>
        }
      />

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

      <HomeTasks
        tasks={mentorTasks}
        menteeId={userId}
        onFeedbackRead={handleFeedbackRead}
      />

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
          {/* Show series columns */}
          {COLUMN_SERIES.map((series, seriesIndex) => {
            // Filter columns for this series from the active fetched data
            const seriesArticles = columns.filter(
              (col) => col.series_id === series.id
            );
            if (seriesArticles.length === 0) return null;

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

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {seriesArticles.map((article) => {
                    const isComingSoon = false; // article.status !== "published" (already filtered by query)

                    const authorName = "서울대 멘토";

                    const dateStr = article.published_at || article.created_at
                      ? new Date(article.published_at || article.created_at).toLocaleDateString()
                      : "";

                    const card = (
                      <div className="min-w-[220px] max-w-[220px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                        <div className="h-[120px] w-full overflow-hidden">
                          {article.cover_image_url ? (
                            <img
                              src={article.cover_image_url}
                              alt={article.title}
                              className={`h-full w-full object-cover ${
                                isComingSoon ? "grayscale" : ""
                              }`}
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <span className="text-[10px] font-black text-gray-400">
                            {authorName}
                          </span>
                          <h5 className="text-sm font-black text-gray-900 line-clamp-2">
                            {article.title}
                          </h5>
                          <p className="text-[11px] text-gray-500 line-clamp-2">
                            {article.subtitle}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>
                    );

                    if (isComingSoon) {
                      return (
                        <div key={article.id} className="relative">
                          {card}
                          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                            <div className="bg-white px-4 py-2 rounded-full shadow-lg">
                              <span className="text-xs font-black text-gray-700">
                                📝 준비중
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={article.id}
                        href={`/column/${article.slug}`}
                        className="block"
                      >
                        {card}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
