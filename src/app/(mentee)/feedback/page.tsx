"use client";

import { useState } from "react";
import Header from "@/components/mentee/layout/Header";
import FeedbackArchive from "@/components/mentee/mypage/FeedbackArchive";
import { MessageSquare, Search } from "lucide-react";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";

export default function FeedbackPage() {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenTask = (task: any) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <Header
                title="피드백 보관함"
                variant="clean"
                rightElement={
                    <button className="p-2.5 text-gray-400 bg-white rounded-full border border-gray-100 shadow-sm hover:text-primary transition-all active:scale-95">
                        <Search size={20} />
                    </button>
                }
            />

            <div className="pt-5">
                <FeedbackArchive onOpenTask={handleOpenTask} />
            </div>

            <TaskDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
            />
        </div>
    );
}
