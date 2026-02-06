"use server";

import {
  createTaskFeedback,
  createMentorTask,
} from "@/repositories/mentorTasksRepository";
import {
  createPlannerTask,
  updatePlannerTask,
} from "@/repositories/plannerTasksRepository";
import { listSubjects } from "@/repositories/subjectsRepository";

export async function getSubjectsAction() {
  try {
    const subjects = await listSubjects();
    return { success: true, data: subjects };
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return { success: false, error: "과목 목록을 불러오는데 실패했습니다." };
  }
}

// ... (existing functions)

// ... (imports)

export async function createMentorTaskAction(
  menteeId: string,
  title: string,
  date: string,
  subjectId: string,
  startTime: string,
  endTime: string,
  description: string,
  materials: { title: string; url: string }[],
) {
  try {
    // Current hardcoded mentor ID for testing/hackathon context
    const MENTOR_ID = "702826a1-0c48-42d0-a643-0d7e123a16bd";

    // Construct deadline from date + endTime
    let deadline = date;
    if (endTime) {
      deadline = `${date}T${endTime}:00`;
    } else {
      deadline = `${date}T23:59:59`;
    }

    await createMentorTask({
      mentor_id: MENTOR_ID,
      mentee_id: menteeId,
      subject_id: subjectId || null,
      title,
      description: description || null,
      status: "pending",
      deadline,
      materials: materials || [],
    });

    revalidatePath(`/mentor/students/${menteeId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to assign mentor task:", error);
    return { success: false, error: "과제 부여에 실패했습니다." };
  }
}
//...
import { revalidatePath } from "next/cache";

export async function submitFeedbackAction(
  taskId: string,
  comment: string,
  rating: number,
) {
  try {
    const MENTOR_ID = "702826a1-0c48-42d0-a643-0d7e123a16bd";
    await createTaskFeedback(taskId, MENTOR_ID, { comment, rating });

    // Revalidate paths to update UI
    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/mentor-feedback");

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: "피드백 전송에 실패했습니다." };
  }
}

export async function submitPlannerFeedbackAction(
  taskId: string,
  comment: string,
  rating: number, // Keep signature compatible for now but ignore it?
  // Or change signature and update Client?
  // Client currently calls with rating.
  // I should probably remove it from signature to be clean, and update Client to pass just comment?
  // No, Client is generic "comment, rating".
  // I'll keep signature "rating: number" to avoid TS error in Client if I share handler,
  // BUT Client uses separate calls.
  // I'll remove rating from signature and update Client call.
) {
  try {
    await updatePlannerTask(taskId, {
      mentorComment: comment,
    });

    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/students");

    return { success: true };
  } catch (error) {
    console.error("Failed to submit planner feedback:", error);
    return { success: false, error: "자습 피드백 저장 실패" };
  }
}
