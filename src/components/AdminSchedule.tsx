import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    UserCheck,
    UserMinus,
    Users
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Types ---
interface ClassSession {
    id: string;
    name: string;
    teacher: string;
    startTime: string; // HH:mm
    duration: number; // minutes
    attendees: number;
    capacity: number;
    category: 'Yoga' | 'Pilates' | 'HIIT' | 'Strength';
    color: string;
}

interface Attendee {
    id: string;
    name: string;
    status: 'Checked-in' | 'Registered' | 'No-show';
    avatar?: string;
}

// --- Mock Data ---
const MOCK_CLASSES: (ClassSession & { dayOffset: number })[] = [
    { id: '1', name: 'Hatha Yoga Flow', teacher: 'Sarah J.', startTime: '08:00', duration: 60, attendees: 12, capacity: 20, category: 'Yoga', color: 'bg-indigo-100 border-indigo-200 text-indigo-700', dayOffset: 0 },
    { id: '2', name: 'Reformers Intro', teacher: 'Mike T.', startTime: '10:00', duration: 45, attendees: 8, capacity: 10, category: 'Pilates', color: 'bg-emerald-100 border-emerald-200 text-emerald-700', dayOffset: 1 },
    { id: '3', name: 'Power HIIT', teacher: 'Anna W.', startTime: '12:00', duration: 60, attendees: 18, capacity: 20, category: 'HIIT', color: 'bg-orange-100 border-orange-200 text-orange-700', dayOffset: 2 },
    { id: '4', name: 'Core Strength', teacher: 'David L.', startTime: '17:00', duration: 75, attendees: 15, capacity: 15, category: 'Strength', color: 'bg-blue-100 border-blue-200 text-blue-700', dayOffset: 3 },
    { id: '5', name: 'Vinyasa Flow', teacher: 'Sarah J.', startTime: '09:00', duration: 60, attendees: 10, capacity: 15, category: 'Yoga', color: 'bg-indigo-100 border-indigo-200 text-indigo-700', dayOffset: 4 },
];

const MOCK_ATTENDEES: Attendee[] = [
    { id: 'a1', name: 'Emily Chen', status: 'Checked-in' },
    { id: 'a2', name: 'James Wilson', status: 'Registered' },
    { id: 'a3', name: 'Sophia Rodriguez', status: 'Checked-in' },
    { id: 'a4', name: 'Liam Zhang', status: 'No-show' },
    { id: 'a5', name: 'Olivia Brown', status: 'Registered' },
];

// --- Components ---

const TimeColumn = () => (
    <div className="flex flex-col border-r border-slate-100 pt-12">
        {Array.from({ length: 16 }).map((_, i) => {
            const hour = 7 + i;
            return (
                <div key={hour} className="h-20 pr-4 text-right">
                    <span className="text-xs font-medium text-slate-400">{hour.toString().padStart(2, '0')}:00</span>
                </div>
            );
        })}
    </div>
);

export const AdminSchedule: React.FC<{ hideSidebar?: boolean }> = ({ hideSidebar = false }) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const handlePrevWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
    const handleNextWeek = () => setCurrentWeek(next => addWeeks(next, 1));
    const handleToday = () => setCurrentWeek(new Date());

    return (
        <div className="flex h-full bg-slate-50 overflow-hidden font-sans">
            {!hideSidebar && <Sidebar activeTab="scheduling" onTabChange={() => { }} />}

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-lg font-bold text-slate-800">
                            {format(weekDays[0], 'yyyy年MM月dd日')} - {format(weekDays[6], 'dd日')}
                        </h1>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={handlePrevWeek}
                                className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleToday}
                                className="px-3 text-sm font-medium hover:bg-white hover:shadow-sm rounded transition-all text-slate-600 mx-1"
                            >
                                今天
                            </button>
                            <button
                                onClick={handleNextWeek}
                                className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <button className="bg-mindbody hover:bg-opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm transition-all hover:shadow-md active:scale-95">
                        <Plus size={18} className="mr-2" />
                        新增課程
                    </button>
                </header>

                {/* Schedule Grid */}
                <main className="flex-1 overflow-auto custom-scrollbar">
                    <div className="min-w-[1000px] bg-white m-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex">
                        <TimeColumn />

                        <div className="flex-1 grid grid-cols-7 relative">
                            {/* Day Headers */}
                            {weekDays.map((day) => (
                                <div key={day.toString()} className="border-r border-slate-100">
                                    <div className={cn(
                                        "flex flex-col items-center py-3 border-b border-slate-100",
                                        isSameDay(day, new Date()) ? "bg-slate-50" : ""
                                    )}>
                                        <span className="text-xs font-semibold text-slate-400 mb-1">{format(day, 'EEE')}</span>
                                        <span className={cn(
                                            "text-xl font-bold flex items-center justify-center w-8 h-8 rounded-full",
                                            isSameDay(day, new Date()) ? "bg-mindbody text-white" : "text-slate-800"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    {/* Grid Lines */}
                                    <div className="relative">
                                        {Array.from({ length: 16 }).map((_, i) => (
                                            <div key={i} className="h-20 border-b border-slate-50" />
                                        ))}

                                        {/* Updated Class Rendering logic */}
                                        {MOCK_CLASSES.filter(cls => cls.dayOffset === (day.getDay() + 6) % 7).map(cls => (
                                            <button
                                                key={cls.id}
                                                onClick={() => setSelectedClass(cls)}
                                                className={cn(
                                                    "absolute left-2 right-2 rounded-lg border p-3 flex flex-col text-left transition-all hover:shadow-md cursor-pointer",
                                                    cls.color
                                                )}
                                                style={{
                                                    top: `${(parseInt(cls.startTime.split(':')[0]) - 7) * 80 + (parseInt(cls.startTime.split(':')[1]) / 60) * 80}px`,
                                                    height: `${(cls.duration / 60) * 80}px`
                                                }}
                                            >
                                                <span className="font-bold text-sm leading-tight truncate">{cls.name}</span>
                                                <span className="text-xs opacity-80 mt-1 font-medium">{cls.teacher}</span>
                                                <div className="mt-auto flex items-center text-xs font-bold">
                                                    <Users size={12} className="mr-1" />
                                                    <span>{cls.attendees}/{cls.capacity}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Slide-over Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300",
                    selectedClass ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setSelectedClass(null)}
            />

            {/* Slide-over Drawer */}
            <aside className={cn(
                "fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transition-transform duration-300 transform border-l border-slate-200",
                selectedClass ? "translate-x-0" : "translate-x-full"
            )}>
                {selectedClass && (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{selectedClass.name}</h2>
                                <p className="text-sm text-slate-500 font-medium">{selectedClass.teacher} • {selectedClass.startTime}</p>
                            </div>
                            <button
                                onClick={() => setSelectedClass(null)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">學員名單 ({selectedClass.attendees})</span>
                                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold">
                                    出席率: {Math.round((MOCK_ATTENDEES.filter(a => a.status === 'Checked-in').length / MOCK_ATTENDEES.length) * 100)}%
                                </span>
                            </div>

                            <div className="space-y-3">
                                {MOCK_ATTENDEES.map((attendee) => (
                                    <div key={attendee.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3">
                                                {attendee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{attendee.name}</p>
                                                <p className={cn(
                                                    "text-xs font-medium",
                                                    attendee.status === 'Checked-in' ? "text-emerald-600" :
                                                        attendee.status === 'No-show' ? "text-red-500" : "text-slate-400"
                                                )}>
                                                    {attendee.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-white rounded-lg transition-all shadow-sm">
                                                <UserCheck size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-white rounded-lg transition-all shadow-sm">
                                                <UserMinus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100">
                            <button className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors active:scale-98">
                                批量簽到
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </div>
    );
};
