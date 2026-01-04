import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    UserCheck,
    UserMinus,
    Users,
    Loader2,
    Calendar as CalendarIcon,
    Clock
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO, setHours, setMinutes } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Types ---
interface ClassTemplate {
    id: string;
    name: string;
    teacher_name: string;
    category: string;
    color_theme: string;
}

interface ClassSession {
    id: string;
    name: string;
    teacher: string;
    startTime: string; // HH:mm
    duration: number; // minutes
    attendees: number;
    capacity: number;
    category: string;
    color: string;
    full_start_time: string; // ISO string
}

interface Attendee {
    id: string;
    name: string;
    status: 'Checked-in' | 'Registered' | 'No-show';
    avatar?: string;
}

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
    const [sessions, setSessions] = useState<ClassSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

    // Add Session Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [templates, setTemplates] = useState<ClassTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [sessionDate, setSessionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [sessionTime, setSessionTime] = useState('08:00');
    const [duration, setDuration] = useState(60);
    const [capacity, setCapacity] = useState(20);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const startStr = weekStart.toISOString();
            const endStr = addDays(weekStart, 7).toISOString();

            const { data, error } = await supabase
                .from('class_sessions')
                .select(`
                    id,
                    start_time,
                    duration_minutes,
                    capacity,
                    classes (
                        name,
                        teacher_name,
                        category,
                        color_theme
                    ),
                    bookings (id)
                `)
                .gte('start_time', startStr)
                .lt('start_time', endStr);

            if (error) throw error;

            const formatted: ClassSession[] = (data || []).map((s: any) => ({
                id: s.id,
                name: s.classes.name,
                teacher: s.classes.teacher_name,
                startTime: format(parseISO(s.start_time), 'HH:mm'),
                duration: s.duration_minutes,
                capacity: s.capacity,
                attendees: s.bookings?.length || 0,
                category: s.classes.category,
                color: s.classes.color_theme,
                full_start_time: s.start_time
            }));

            setSessions(formatted);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const { data, error } = await supabase.from('classes').select('*');
            if (error) throw error;
            setTemplates(data || []);
            if (data && data.length > 0) setSelectedTemplateId(data[0].id);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchAttendees = async (sessionId: string) => {
        setIsLoadingAttendees(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    members (
                        id,
                        name
                    )
                `)
                .eq('session_id', sessionId);

            if (error) throw error;

            const formatted: Attendee[] = (data || []).map((b: any) => ({
                id: b.members.id,
                name: b.members.name,
                status: b.status
            }));

            setAttendees(formatted);
        } catch (error) {
            console.error('Error fetching attendees:', error);
        } finally {
            setIsLoadingAttendees(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [currentWeek]);

    useEffect(() => {
        if (selectedClass) {
            fetchAttendees(selectedClass.id);
        } else {
            setAttendees([]);
        }
    }, [selectedClass]);

    useEffect(() => {
        if (isAddModalOpen) {
            fetchTemplates();
        }
    }, [isAddModalOpen]);

    const handlePrevWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
    const handleNextWeek = () => setCurrentWeek(next => addWeeks(next, 1));
    const handleToday = () => setCurrentWeek(new Date());

    const handleAddSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const [hours, minutes] = sessionTime.split(':').map(Number);
            const date = parseISO(sessionDate);
            const combinedDateTime = setMinutes(setHours(date, hours), minutes);

            const { error } = await supabase
                .from('class_sessions')
                .insert([{
                    class_id: selectedTemplateId,
                    start_time: combinedDateTime.toISOString(),
                    duration_minutes: duration,
                    capacity: capacity
                }]);

            if (error) throw error;

            setIsAddModalOpen(false);
            fetchSessions();
        } catch (error) {
            console.error('Error adding session:', error);
            alert('新增課程失敗，請稍後再試。');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        {isLoading && <Loader2 className="animate-spin text-mindbody" size={20} />}
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-mindbody hover:bg-opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm transition-all hover:shadow-md active:scale-95"
                    >
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

                                        {/* Class Rendering */}
                                        {sessions.filter(s => isSameDay(parseISO(s.full_start_time), day)).map(cls => (
                                            <button
                                                key={cls.id}
                                                onClick={() => setSelectedClass(cls)}
                                                className={cn(
                                                    "absolute left-2 right-2 rounded-lg border p-3 flex flex-col text-left transition-all hover:shadow-md cursor-pointer z-10",
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
                    "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] transition-opacity duration-300",
                    selectedClass ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setSelectedClass(null)}
            />

            {/* Slide-over Drawer */}
            <aside className={cn(
                "fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-[110] transition-transform duration-300 transform border-l border-slate-200",
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
                                {attendees.length > 0 && (
                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold">
                                        出席率: {Math.round((attendees.filter(a => a.status === 'Checked-in').length / attendees.length) * 100)}%
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                {isLoadingAttendees ? (
                                    <div className="flex flex-col items-center py-10 space-y-2">
                                        <Loader2 className="animate-spin text-slate-300" size={24} />
                                        <p className="text-xs font-medium text-slate-400">載入中...</p>
                                    </div>
                                ) : attendees.length === 0 ? (
                                    <p className="text-center py-10 text-slate-400 text-sm italic">尚無學員預約</p>
                                ) : (
                                    attendees.map((attendee) => (
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
                                    ))
                                )}
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

            {/* Add Session Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <form onSubmit={handleAddSession} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">新增課表內容</h3>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">選擇課程種類</label>
                                <select
                                    required
                                    value={selectedTemplateId}
                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20 appearance-none"
                                >
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.teacher_name})</option>
                                    ))}
                                    {templates.length === 0 && <option disabled>讀取中或無模板...</option>}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                                        <CalendarIcon size={14} className="mr-1" /> 日期
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={sessionDate}
                                        onChange={(e) => setSessionDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                                        <Clock size={14} className="mr-1" /> 開始時間
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={sessionTime}
                                        onChange={(e) => setSessionTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">時長 (分鐘)</label>
                                    <input
                                        type="number"
                                        required
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">容納人數</label>
                                    <input
                                        type="number"
                                        required
                                        value={capacity}
                                        onChange={(e) => setCapacity(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={isSubmitting || templates.length === 0}
                                type="submit"
                                className="w-full bg-mindbody text-white py-4 rounded-2xl font-bold shadow-lg shadow-mindbody/20 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 transition-all mt-4 flex items-center justify-center space-x-2"
                            >
                                {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                                <span>發佈到課表</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
