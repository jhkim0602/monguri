import { getMentorDashboardData } from "@/services/mentorDashboardService";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Hardcoded Mentor ID for development, based on profiles table scan
  const MENTOR_ID = "702826a1-0c48-42d0-a643-0d7e123a16bd";

  const dashboardData = await getMentorDashboardData(MENTOR_ID);

  return (
    <DashboardClient
      mentees={dashboardData.mentees}
      recentActivity={dashboardData.recentActivity}
      stats={dashboardData.stats}
    />
  );
}
