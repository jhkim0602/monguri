import { HttpError } from "@/lib/httpErrors";
import { getMentorMenteeRelationshipByMentorAndMentee } from "@/repositories/mentorMenteeRepository";
import { getProfileById } from "@/repositories/profilesRepository";

export async function ensureMentorProfile(mentorId: string) {
  const profile = await getProfileById(mentorId);

  if (!profile) {
    throw new HttpError(404, "Mentor profile not found.");
  }

  if (profile.role !== "mentor" && profile.role !== "admin") {
    throw new HttpError(403, "Profile is not a mentor.");
  }

  return profile;
}

export async function ensureMenteeAssignedToMentor(
  mentorId: string,
  menteeId: string,
) {
  const relationship = await getMentorMenteeRelationshipByMentorAndMentee(
    mentorId,
    menteeId,
  );

  if (!relationship) {
    throw new HttpError(403, "Mentee is not assigned to mentor.");
  }

  return relationship;
}
