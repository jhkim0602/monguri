import { NextRequest, NextResponse } from "next/server";
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
        await deletePlannerRecurringGroup(groupId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting recurring group:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete group" },
            { status: 500 }
        );
    }
}
