import React, { useState, useEffect } from 'react';
import {
    Bell,
    Clock,
    Filter,
    CheckCircle2,
    CalendarDays,
    XCircle,
    Loader2
} from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Types ---
interface ClassItem {
    id: string;
    name: string;
    teacher: string;
    startTime: string;
    duration: number;
    remainingSlots: number;
    totalSlots: number;
    category: string;
    full_start_time: string;
    isBooked: boolean;
}

interface ClientBookingProps {
    memberId: string;
}

const CATEGORIES = ['所有課程', 'Yoga', 'Pilates', 'HIIT', 'Strength'];

export const ClientBooking: React.FC<ClientBookingProps> = ({ memberId }) => {
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [activeCategory, setActiveCategory] = useState('所有課程');
    const [isBooking, setIsBooking] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'failure' | 'no_sessions'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const [sessions, setSessions] = useState<ClassItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Generate week dates
    const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i));

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            // Fetch sessions for the selected day
            const startStr = selectedDate.toISOString();
            const endStr = addDays(selectedDate, 1).toISOString();

            const { data: sessionData, error: sessionError } = await supabase
                .from('class_sessions')
                .select(`
                    id,
                    start_time,
                    duration_minutes,
                    capacity,
                    classes (
                        name,
                        teacher_name,
                        category
                    ),
                    bookings (member_id)
                `)
                .gte('start_time', startStr)
                .lt('start_time', endStr);

            if (sessionError) throw sessionError;

            const formatted: ClassItem[] = (sessionData || []).map((s: any) => ({
                id: s.id,
                name: s.classes.name,
                teacher: s.classes.teacher_name,
                startTime: format(parseISO(s.start_time), 'HH:mm'),
                duration: s.duration_minutes,
                totalSlots: s.capacity,
                remainingSlots: s.capacity - (s.bookings?.length || 0),
                category: s.classes.category,
                full_start_time: s.start_time,
                isBooked: s.bookings?.some((b: any) => b.member_id === memberId) || false
            }));

            setSessions(formatted);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [selectedDate, memberId]);

    const handleBooking = async (cls: ClassItem) => {
        if (cls.isBooked) return;
        setIsBooking(true);
        setBookingStatus('idle');

        try {
            // 1. Check if member has remaining sessions
            const { data: member, error: memberError } = await supabase
                .from('members')
                .select('remaining_sessions')
                .eq('id', memberId)
                .single();

            if (memberError) throw memberError;
            if (member.remaining_sessions <= 0) {
                setErrorMessage('剩餘堂數不足，請聯繫櫃檯儲值。');
                setBookingStatus('failure');
                setIsBooking(false);
                setTimeout(() => setBookingStatus('idle'), 3000);
                return;
            }

            // 2. Insert booking
            const { error: bookingError } = await supabase
                .from('bookings')
                .insert([{
                    session_id: cls.id,
                    member_id: memberId,
                    status: 'Registered'
                }]);

            if (bookingError) {
                if (bookingError.code === '23505') {
                    setErrorMessage('您已預約過此課程。');
                } else {
                    setErrorMessage('預約失敗，課程可能已額滿。');
                }
                throw bookingError;
            }

            // 3. Decrement sessions count
            const { error: updateError } = await supabase
                .from('members')
                .update({ remaining_sessions: member.remaining_sessions - 1 })
                .eq('id', memberId);

            if (updateError) throw updateError;

            setBookingStatus('success');
            fetchSessions();
        } catch (error) {
            console.error('Booking error:', error);
            if (bookingStatus !== 'failure') {
                setBookingStatus('failure');
                setErrorMessage('系統繁忙，請稍後再試。');
            }
        } finally {
            setIsBooking(false);
            setTimeout(() => setBookingStatus('idle'), 3000);
        }
    };

    const filteredSessions = sessions.filter(s =>
        activeCategory === '所有課程' || s.category === activeCategory
    );

    return (
        <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col font-sans text-slate-900 pb-20 overflow-x-hidden relative">
            {/* Loading Overlay */}
            {isBooking && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-mindbody border-t-transparent rounded-full mb-4"
                    />
                    <p className="font-bold text-slate-800 animate-pulse">正在為您確認名額...</p>
                </div>
            )}

            {/* Success/Failure Alerts */}
            <AnimatePresence>
                {bookingStatus === 'success' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="fixed top-20 left-4 right-4 bg-emerald-500 text-white p-4 rounded-2xl z-[110] shadow-xl flex items-center max-w-[calc(100%-2rem)]"
                    >
                        <CheckCircle2 className="mr-3 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold">預約成功！</p>
                            <p className="text-xs opacity-90">課程已加入您的行程，點數已扣除。</p>
                        </div>
                    </motion.div>
                )}
                {bookingStatus === 'failure' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="fixed top-20 left-4 right-4 bg-red-500 text-white p-4 rounded-2xl z-[110] shadow-xl flex items-center max-w-[calc(100%-2rem)]"
                    >
                        <XCircle className="mr-3 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold">預約失敗</p>
                            <p className="text-xs opacity-90">{errorMessage}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-30 px-5 h-16 flex items-center justify-between border-b border-slate-100">
                <h1 className="text-xl font-black italic tracking-tighter text-mindbody uppercase">Mindbody</h1>
                <div className="flex items-center space-x-3">
                    <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <Bell size={22} className="text-slate-600" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-mindbody/10 flex items-center justify-center border border-mindbody/20">
                        <User size={20} className="text-mindbody" />
                    </div>
                </div>
            </header>

            {/* Date & Filters */}
            <div className="bg-white">
                <div className="py-4 px-2 overflow-x-auto no-scrollbar">
                    <div className="flex space-x-2 px-3">
                        {weekDates.map((date) => {
                            const isSelected = isSameDay(date, selectedDate);
                            return (
                                <button
                                    key={date.toString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "flex flex-col items-center justify-center min-w-[56px] h-20 rounded-2xl transition-all duration-300",
                                        isSelected ? "bg-mindbody text-white shadow-lg shadow-pink-200" : "bg-slate-50 text-slate-400"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase mb-1">{format(date, 'eee')}</span>
                                    <span className="text-lg font-black">{format(date, 'd')}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pb-4 overflow-x-auto no-scrollbar">
                    <div className="flex space-x-2 px-5">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                                    activeCategory === cat
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                            >
                                {cat === 'Yoga' ? '瑜珈' : cat === 'Pilates' ? '皮拉提斯' : cat === 'Strength' ? '重訓' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Session List */}
            <div className="p-5 space-y-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{format(selectedDate, 'PPP')}</span>
                    {isLoading && <Loader2 className="animate-spin text-slate-200" size={20} />}
                </div>

                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="animate-spin text-mindbody" size={32} />
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-300 space-y-2">
                            <CalendarDays size={48} />
                            <p className="font-bold underline underline-offset-4 decoration-mindbody/20">今日尚無課程安排</p>
                        </div>
                    ) : (
                        filteredSessions.map((cls, index) => (
                            <motion.div
                                key={cls.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center group"
                            >
                                <div className="pr-4 border-r border-slate-50 flex flex-col items-center justify-center min-w-[70px]">
                                    <span className="text-xl font-black text-slate-800 leading-none">{cls.startTime.split(':')[0]}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">{cls.startTime.split(':')[1]}</span>
                                </div>

                                <div className="flex-1 px-4 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                            {cls.category === 'Yoga' ? '瑜珈' : cls.category}
                                        </span>
                                        {cls.remainingSlots > 0 && cls.remainingSlots <= 3 && (
                                            <span className="text-[10px] font-black bg-red-100 text-red-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter animate-pulse">
                                                即將額滿
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 truncate">{cls.name}</h3>
                                    <div className="flex items-center text-xs text-slate-400 font-medium mt-1">
                                        <span className="truncate">{cls.teacher}</span>
                                        <span className="mx-1.5 text-slate-200">•</span>
                                        <span>{cls.duration} min</span>
                                    </div>
                                </div>

                                <div className="pl-2">
                                    {cls.isBooked ? (
                                        <button disabled className="w-20 h-10 rounded-2xl border-2 border-emerald-500 text-emerald-500 flex items-center justify-center font-bold text-sm bg-emerald-50">
                                            <CheckCircle2 size={16} className="mr-1" />
                                            已訂
                                        </button>
                                    ) : cls.remainingSlots <= 0 ? (
                                        <button disabled className="w-20 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm">
                                            額滿
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBooking(cls)}
                                            className="w-20 h-10 rounded-2xl bg-mindbody text-white flex items-center justify-center font-bold text-sm shadow-md shadow-pink-100 transition-all active:scale-90"
                                        >
                                            預約
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-slate-100 px-8 py-3 flex justify-between items-center z-40">
                <TabItem icon={<CalendarDays size={20} />} label="預約" active />
                <TabItem icon={<Clock size={20} />} label="探索" />
                <TabItem icon={<Bell size={20} />} label="通知" />
                <TabItem icon={<User size={20} />} label="我的" />
            </footer>
        </div>
    );
};

const TabItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <button className={cn(
        "flex flex-col items-center space-y-1 transition-colors",
        active ? "text-mindbody" : "text-slate-300"
    )}>
        {icon}
        <span className="text-[10px] font-black">{label}</span>
    </button>
);
