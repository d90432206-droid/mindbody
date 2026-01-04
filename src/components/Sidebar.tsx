import React from 'react';
import {
    Calendar,
    Users,
    CreditCard,
    Settings,
    LayoutDashboard
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type AdminTab = 'overview' | 'scheduling' | 'members' | 'sales' | 'settings';

interface SidebarProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => (
    <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-8 space-y-8 flex-shrink-0 z-20">
        <div className="w-10 h-10 bg-mindbody rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
        <nav className="flex flex-col space-y-6">
            <SidebarLink
                icon={<LayoutDashboard size={24} />}
                label="總覽"
                active={activeTab === 'overview'}
                onClick={() => onTabChange('overview')}
            />
            <SidebarLink
                icon={<Calendar size={24} />}
                label="排課"
                active={activeTab === 'scheduling'}
                onClick={() => onTabChange('scheduling')}
            />
            <SidebarLink
                icon={<Users size={24} />}
                label="會員"
                active={activeTab === 'members'}
                onClick={() => onTabChange('members')}
            />
            <SidebarLink
                icon={<CreditCard size={24} />}
                label="銷售"
                active={activeTab === 'sales'}
                onClick={() => onTabChange('sales')}
            />
            <SidebarLink
                icon={<Settings size={24} />}
                label="設定"
                active={activeTab === 'settings'}
                onClick={() => onTabChange('settings')}
            />
        </nav>
    </div>
);

const SidebarLink = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "p-3 rounded-xl transition-all group relative",
            active ? "bg-slate-100 text-mindbody" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
        )}
    >
        {icon}
        <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
            {label}
        </span>
    </button>
);
