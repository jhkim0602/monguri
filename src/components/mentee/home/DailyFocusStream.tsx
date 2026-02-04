"use client";

import { MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";
import YesterdayRecap from "./sections/YesterdayRecap";
import TodayTimeline from "./sections/TodayTimeline";
import TomorrowPreview from "./sections/TomorrowPreview";

export default function DailyFocusStream() {
    // Basic Data Logic (Same as before)
    // Mock Date: Feb 2, 2026
    const today = new Date(2026, 1, 2);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isSameDay = (d1: Date, d2?: Date) => {
        if (!d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    const allTasks = [
        ...MENTOR_TASKS.map(t => ({...t, type: 'mentor'})),
        ...USER_TASKS.map(t => ({...t, type: 'user'}))
    ];

    // 1. Yesterday Data
    const yesterdayTasks = allTasks.filter(t => isSameDay(yesterday, t.deadline));
    const missedTasks = yesterdayTasks.filter(t => t.status !== 'submitted' && t.status !== 'feedback_completed');
    const feedbackTasks = yesterdayTasks.filter(t => t.status === 'feedback_completed');

    // 2. Today Data
    // Sort: Pending -> Submitted
    const todayTasks = allTasks.filter(t => isSameDay(today, t.deadline)).sort((a, b) => {
        const score = (s: string) => (s === 'pending' ? 0 : 1);
        return score(a.status) - score(b.status);
    });

    // 3. Tomorrow Data
    const tomorrowTasks = allTasks.filter(t => isSameDay(tomorrow, t.deadline));

    return (
        <div className="flex flex-col min-h-[300px]">
            {/* Top Stack: Recap */}
            <YesterdayRecap
                missedTasks={missedTasks}
                feedbackTasks={feedbackTasks}
            />

            {/* Center Stack: Main Stream */}
            <TodayTimeline tasks={todayTasks} />

            {/* Bottom Stack: Preview */}
            <TomorrowPreview tasks={tomorrowTasks} />
        </div>
    );
}
