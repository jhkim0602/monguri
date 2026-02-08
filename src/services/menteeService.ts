import { HttpError } from "@/lib/httpErrors";
import { getMentorByMenteeId } from "@/repositories/mentorMenteeRepository";
import {
  getProfileById,
  updateProfileById,
  type ProfileUpdateInput,
} from "@/repositories/profilesRepository";

export async function getMenteeProfile(profileId: string) {
  const profile = await getProfileById(profileId);

  if (!profile) {
    throw new HttpError(404, "Profile not found.");
  }

  if (profile.role !== "mentee") {
    throw new HttpError(403, "Profile is not a mentee.");
  }

  return profile;
}

export async function getMentorForMentee(menteeId: string) {
  await getMenteeProfile(menteeId);

  return getMentorByMenteeId(menteeId);
}

export async function updateMenteeProfile(
  profileId: string,
  updates: ProfileUpdateInput
) {
  // Verify the profile exists and is a mentee
  await getMenteeProfile(profileId);

  // Update the profile
  const updatedProfile = await updateProfileById(profileId, updates);

  return updatedProfile;
}
