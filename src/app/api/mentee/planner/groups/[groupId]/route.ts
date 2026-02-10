import { NextRequest, NextResponse } from "next/server";
import { revalidateMenteeHomeCacheByMenteeId } from "@/lib/menteeHomeServerCache";
import { revalidateMentorSurfaceCachesByMenteeId } from "@/lib/mentorServerCache";
import { supabaseServer } from "@/lib/supabaseServer";
import { deletePlannerRecurringGroup } from "@/repositories/plannerTasksRepository";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { groupId: string } }
) {
    try {
        const groupId = params.groupId;

        if (!groupId) {
            return NextResponse.json(
                { error: "Group ID is required" },
                { status: 400 }
            );
        }

        // Logic to delete the group
        // Since we set ON DELETE CASCADE in DB, this will delete all tasks in the group.
        const { data: recurringGroup } = await supabaseServer
            .from("planner_recurring_groups")
            .select("mentee_id")
            .eq("id", groupId)
            .maybeSingle();

        await deletePlannerRecurringGroup(groupId);
        if (recurringGroup?.mentee_id) {
            revalidateMenteeHomeCacheByMenteeId(recurringGroup.mentee_id);
            await revalidateMentorSurfaceCachesByMenteeId(recurringGroup.mentee_id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting recurring group:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete group" },
            { status: 500 }
        );
    }
}
