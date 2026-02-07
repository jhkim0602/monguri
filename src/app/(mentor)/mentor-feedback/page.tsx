import { getPendingFeedbackItems } from "@/services/mentorFeedbackService";
import FeedbackClient from "./FeedbackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: { taskId?: string };
}) {
  // Hardcoded Mentor ID for development
  const MENTOR_ID = "702826a1-0c48-42d0-a643-0d7e123a16bd";

  const pendingItems = await getPendingFeedbackItems(MENTOR_ID);

  return (
    <FeedbackClient
      initialItems={pendingItems}
      initialSelectedTaskId={searchParams.taskId}
    />
  );
}
