import { HttpError } from "@/lib/httpErrors";
import { getMentorByMenteeId } from "@/repositories/mentorMenteeRepository";
import {
  getProfileById,
  updateProfileById,
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

export async function getProfileForMenteePage(profileId: string) {
  const profile = await getProfileById(profileId);

  if (!profile) {
    throw new HttpError(404, "Profile not found.");
  }

  if (profile.role !== "mentee" && profile.role !== "mentor") {
    throw new HttpError(403, "Unsupported profile role.");
  }

  return profile;
}

export async function getMentorForMentee(menteeId: string) {
  await getMenteeProfile(menteeId);

  return getMentorByMenteeId(menteeId);
}

type MenteeProfileUpdateInput = {
  name?: string | null;
  intro?: string | null;
  avatarUrl?: string | null;
};

export async function updateMenteeProfile(
  profileId: string,
  updates: MenteeProfileUpdateInput,
) {
  await getProfileForMenteePage(profileId);

  const updated = await updateProfileById(profileId, {
    name: updates.name,
    intro: updates.intro,
    avatar_url: updates.avatarUrl,
  });

  if (!updated) {
    throw new HttpError(500, "Failed to update profile.");
  }

  return updated;
}
