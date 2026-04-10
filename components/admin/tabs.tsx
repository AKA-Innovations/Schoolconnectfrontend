'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { School, Settings2, GraduationCap, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
    icon: LucideIcon;
}

const tabs: Tab[] = [
    { id: 'teachers', label: 'Teachers', icon: School },
    { id: 'overview', label: 'Admin', icon: Settings2 },
    { id: 'students', label: 'Student', icon: GraduationCap },
];

export default function SlidingTabs({
    activeTab,
    onChange
}: {
    activeTab: string,
    onChange: (id: string) => void
}) {
    return (
        <div className="flex items-center justify-center p-4">
            {/* Outer Rail - matches the soft purple/blue tint from your image */}
            <div className="relative flex items-center bg-[#f0f2ff] border border-[#e0e4ff] p-1.5 rounded-full shadow-sm">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300",
                                "focus:outline-none focus-visible:ring-0", // Removes those extra borders/rings
                                isActive ? "text-white" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {/* Ensure Icon and Text stay above the sliding pill */}
                            <Icon size={18} className="relative z-10" />
                            <span className="relative z-10">{tab.label}</span>

                            {/* Animated Sliding Background */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-blue-600 rounded-full shadow-md"
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 30,
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}