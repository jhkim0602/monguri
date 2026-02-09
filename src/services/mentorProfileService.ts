import { updateProfileById } from "@/repositories/profilesRepository";
import { ensureMentorProfile } from "@/services/mentorAccessService";

type MentorProfileUpdateInput = {
  name?: string;
  intro?: string | null;
  avatar_url?: string | null;
};

export async function getMentorProfile(mentorId: string) {
  return ensureMentorProfile(mentorId);
}

export async function updateMentorProfile(
  mentorId: string,
  updates: MentorProfileUpdateInput,
) {
  await ensureMentorProfile(mentorId);
  return updateProfileById(mentorId, updates);
}
