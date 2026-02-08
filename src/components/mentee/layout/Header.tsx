"use client";

import { Search, MessageCircle } from "lucide-react";
import Link from "next/link";
import { NotificationBadge } from "@/components/ui";

interface HeaderProps {
    title: string;
    rightElement?: React.ReactNode;
    variant?: 'default' | 'clean';
}

export default function Header({ title, rightElement, variant = 'default' }: HeaderProps) {
    if (variant === 'clean') {
        return (
            <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white border-b border-gray-50">
                <h1 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-3">{title}</h1>
                <div className="flex items-center h-10">
                    {rightElement}
                </div>
            </header>
        );
    }

    // Default variant (Original style)
    return (
        <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-white">
            <h1 className="text-2xl font-bold text-blue-900">{title}</h1>
            <div className="flex items-center">
                {rightElement || (
                    <div className="flex gap-4 text-gray-400 items-center">
                        <Link href="/chat" className="hover:text-primary transition-colors">
                            <MessageCircle size={24} />
                        </Link>
                        <Search size={24} />
                        <NotificationBadge iconSize={24} />
                    </div>
                )}
            </div>
        </header>
    );
}
