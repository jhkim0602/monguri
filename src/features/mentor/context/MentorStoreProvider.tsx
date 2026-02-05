"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  MentorStore,
  MentorTask,
  MentorTaskInput,
  MentorTaskStatus,
  MentorColumn,
  MentorColumnInput,
  PlannerDaySummary,
  MentorCalendarEvent,
} from "@/features/mentor/types";
import {
  createInitialMentorStore,
  loadMentorStore,
  saveMentorStore,
} from "@/features/mentor/data/store";

type MentorStoreContextValue = {
  store: MentorStore;
  createTask: (input: MentorTaskInput) => void;
  createTasks: (input: MentorTaskInput, dates: Date[]) => void;
  updateTaskStatus: (id: MentorTask["id"], status: MentorTaskStatus) => void;
  updateTaskComment: (id: MentorTask["id"], comment: string) => void;
  savePlannerComment: (dayId: PlannerDaySummary["id"], comment: string) => void;
  createColumnDraft: (input: MentorColumnInput) => void;
  publishColumn: (id: MentorColumn["id"]) => void;
  addMentorCalendarEvent: (input: Omit<MentorCalendarEvent, "id">) => void;
  removeMentorCalendarEvent: (id: MentorCalendarEvent["id"]) => void;
};

const MentorStoreContext = createContext<MentorStoreContextValue | null>(null);

export function MentorStoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<MentorStore>(createInitialMentorStore);

  useEffect(() => {
    const stored = loadMentorStore();
    if (stored) setStore(stored);
  }, []);

  useEffect(() => {
    saveMentorStore(store);
  }, [store]);

  const createTask = (input: MentorTaskInput) => {
    setStore((prev) => ({
      ...prev,
      tasks: [
        {
          id: `t-${Date.now()}`,
          menteeId: input.menteeId,
          subject: input.subject,
          title: input.title,
          description: input.description,
          status: "pending" as MentorTaskStatus,
          deadline: input.deadline,
          startTime: input.startTime,
          endTime: input.endTime,
          mentorComment: "",
        },
        ...prev.tasks,
      ],
    }));
  };

  const createTasks = (input: MentorTaskInput, dates: Date[]) => {
    if (dates.length === 0) return;
    const timestamp = Date.now();
    setStore((prev) => ({
      ...prev,
      tasks: [
        ...dates.map((date, index) => ({
          id: `t-${timestamp}-${index}`,
          menteeId: input.menteeId,
          subject: input.subject,
          title: input.title,
          description: input.description,
          status: "pending" as MentorTaskStatus,
          deadline: date,
          startTime: input.startTime,
          endTime: input.endTime,
          mentorComment: "",
        })),
        ...prev.tasks,
      ],
    }));
  };

  const updateTaskStatus = (id: MentorTask["id"], status: MentorTaskStatus) => {
    setStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, status } : task,
      ),
    }));
  };

  const updateTaskComment = (id: MentorTask["id"], comment: string) => {
    setStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id
          ? { ...task, mentorComment: comment, hasMentorResponse: !!comment }
          : task,
      ),
    }));
  };

  const savePlannerComment = (
    dayId: PlannerDaySummary["id"],
    comment: string,
  ) => {
    setStore((prev) => ({
      ...prev,
      plannerComments: {
        ...prev.plannerComments,
        [dayId]: comment,
      },
    }));
  };

  const createColumnDraft = (input: MentorColumnInput) => {
    setStore((prev) => ({
      ...prev,
      columns: [
        {
          id: `c-${Date.now()}`,
          slug: `draft-${Date.now()}`,
          seriesId: input.seriesId,
          title: input.title,
          subtitle: input.subtitle,
          author: input.author,
          date: new Date().toLocaleDateString("ko-KR"),
          coverImage: input.coverImage,
          excerpt: input.excerpt,
          status: "draft",
          content: input.content,
          createdAt: new Date(),
          publishedAt: null,
        },
        ...prev.columns,
      ],
    }));
  };

  const publishColumn = (id: MentorColumn["id"]) => {
    setStore((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === id
          ? {
              ...column,
              status: "published",
              publishedAt: new Date(),
            }
          : column,
      ),
    }));
  };

  const addMentorCalendarEvent = (
    input: Omit<MentorCalendarEvent, "id">,
  ) => {
    setStore((prev) => ({
      ...prev,
      mentorCalendarEvents: [
        {
          id: `mentor-ev-${Date.now()}`,
          ...input,
        },
        ...prev.mentorCalendarEvents,
      ],
    }));
  };

  const removeMentorCalendarEvent = (id: MentorCalendarEvent["id"]) => {
    setStore((prev) => ({
      ...prev,
      mentorCalendarEvents: prev.mentorCalendarEvents.filter(
        (event) => event.id !== id,
      ),
    }));
  };

  const value = useMemo(
    () => ({
      store,
      createTask,
      createTasks,
      updateTaskStatus,
      updateTaskComment,
      savePlannerComment,
      createColumnDraft,
      publishColumn,
      addMentorCalendarEvent,
      removeMentorCalendarEvent,
    }),
    [store],
  );

  return (
    <MentorStoreContext.Provider value={value}>
      {children}
    </MentorStoreContext.Provider>
  );
}

export const useMentorStore = () => {
  const context = useContext(MentorStoreContext);
  if (!context) throw new Error("MentorStoreProvider is missing");
  return context;
};
