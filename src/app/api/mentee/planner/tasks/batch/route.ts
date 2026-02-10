import { NextRequest, NextResponse } from "next/server";
import {
    createPlannerRecurringGroup,
    createPlannerTaskBatch,
} from "@/repositories/plannerTasksRepository";
import { revalidateMenteeHomeCacheByMenteeId } from "@/lib/menteeHomeServerCache";
import { revalidateMentorSurfaceCachesByMenteeId } from "@/lib/mentorServerCache";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const menteeId = searchParams.get("menteeId");
        const body = await req.json();

        if (!menteeId) {
            return NextResponse.json(
                { error: "Mentee ID is required" },
                { status: 400 }
            );
        }

        const { tasks, recurrenceRule } = body;

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return NextResponse.json(
                { error: "Tasks array is required" },
                { status: 400 }
            );
        }

        // Fetch Subject Map
        const { data: subjectsData } = await supabaseServer
            .from('subjects')
            .select('id, slug');

        const subjectMap: Record<string, string> = {};
        if (subjectsData) {
            subjectsData.forEach((s: any) => {
                if (s.slug) subjectMap[s.slug] = s.id;
            });
        }

        let recurringGroupId: string | undefined = undefined;

        if (recurrenceRule) {
            const group = await createPlannerRecurringGroup(menteeId, recurrenceRule);
            if (group) {
                recurringGroupId = group.id;
            }
        }

        const taskInputs = tasks.map((t: any) => {
            let subjectId = t.subjectId;
            if (typeof subjectId === 'string' && subjectMap[subjectId]) {
                subjectId = subjectMap[subjectId];
            } else if (typeof subjectId === 'string' && !subjectId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                subjectId = null;
            }

            return {
                ...t,
                menteeId: menteeId,
                subjectId: subjectId,
            };
        });

        const result = await createPlannerTaskBatch(taskInputs, recurringGroupId);
        revalidateMenteeHomeCacheByMenteeId(menteeId);
        await revalidateMentorSurfaceCachesByMenteeId(menteeId);

        return NextResponse.json({
            success: true,
            count: result.length,
            recurringGroupId,
        });
    } catch (error: any) {
        console.error("Error creating batch tasks:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create tasks" },
            { status: 500 }
        );
    }
}
