"use client";

import { Search, Bell } from "lucide-react";

interface HeaderProps {
    title: string;
    showIcons?: boolean;
}

export default function Header({ title, showIcons = true }: HeaderProps) {
    return (
        <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-20">
            <h1 className="text-2xl font-bold text-blue-900">{title}</h1>
            {showIcons && (
                <div className="flex gap-4 text-gray-400">
                    <Search size={24} />
                    <Bell size={24} />
                </div>
            )}
        </header>
    );
}
