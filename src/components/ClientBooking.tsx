import React, { useState } from 'react';
import {
    Bell,
    Clock,
    Filter,
    CheckCircle2,
    CalendarDays,
    XCircle
} from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    status: 'available' | 'booked' | 'waitlist';
}

// --- Mock Data ---
const CLASSES: ClassItem[] = [
    { id: '1', name: 'Vinyasa Flow Yoga', teacher: 'Sarah Jenkins', startTime: '08:00', duration: 60, remainingSlots: 2, totalSlots: 20, category: '瑜珈', status: 'available' },
    { id: '2', name: 'Classical Pilates', teacher: 'Mike Thompson', startTime: '09:30', duration: 45, remainingSlots: 10, totalSlots: 12, category: '皮拉提斯', status: 'booked' },
    { id: '3', name: 'HIIT & Burn', teacher: 'Anna White', startTime: '12:00', duration: 50, remainingSlots: 0, totalSlots: 15, category: '重量訓練', status: 'waitlist' },
    { id: '4', name: 'Power Yoga', teacher: 'Sarah Jenkins', startTime: '17:30', duration: 75, remainingSlots: 5, totalSlots: 20, category: '瑜珈', status: 'available' },
    { id: '5', name: 'Core Blitz', teacher: 'David Lee', startTime: '19:00', duration: 30, remainingSlots: 1, totalSlots: 10, category: '重量訓練', status: 'available' },
];

const CATEGORIES = ['所有課程', '瑜珈', '皮拉提斯', '重量訓練', 'HIIT'];

export const ClientBooking: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [activeCategory, setActiveCategory] = useState('所有課程');
    const [isBooking, setIsBooking] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'failure'>('idle');
    const [simulateConflict, setSimulateConflict] = useState(false);

    // Generate week dates
    const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i));

    const handleBooking = (cls: ClassItem) => {
        setIsBooking(true);
        setBookingStatus('idle');

        // Simulate network delay
        setTimeout(() => {
            if (simulateConflict && cls.remainingSlots === 1) {
                setBookingStatus('failure');
            } else {
                setBookingStatus('success');
            }
            setIsBooking(false);

            // Auto close success/failure after 3s
            setTimeout(() => setBookingStatus('idle'), 3000);
        }, 1500);
    };

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
                        className="absolute top-20 left-4 right-4 bg-emerald-500 text-white p-4 rounded-2xl z-[110] shadow-xl flex items-center"
                    >
                        <CheckCircle2 className="mr-3" />
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
                        className="absolute top-20 left-4 right-4 bg-red-500 text-white p-4 rounded-2xl z-[110] shadow-xl flex items-center"
                    >
                        <XCircle className="mr-3" />
                        <div className="flex-1">
                            <p className="font-bold">預約失敗：名額剛已額滿</p>
                            <p className="text-xs opacity-90">抱歉，在您點擊的瞬間，最後一個名額已被搶走。</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-30 px-5 h-16 flex items-center justify-between border-b border-slate-100">
                <h1 className="text-xl font-black italic tracking-tighter text-mindbody uppercase">Mindbody</h1>
                <div className="flex items-center space-x-2">
                    {/* Debug Toggle */}
                    <button
                        onClick={() => setSimulateConflict(!simulateConflict)}
                        className={cn(
                            "text-[10px] font-black px-2 py-1 rounded-full border transition-all",
                            simulateConflict ? "bg-red-100 border-red-200 text-red-500" : "bg-slate-100 border-slate-200 text-slate-400"
                        )}
                    >
                        模擬衝突: {simulateConflict ? 'ON' : 'OFF'}
                    </button>
                    <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <Bell size={22} className="text-slate-600" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-mindbody rounded-full border-2 border-white"></span>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100">
                        <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" alt="Avatar" />
                    </div>
                </div>
            </header>

            {/* Hero Section Container */}
            <div className="bg-white">
                {/* Horizontal Date Picker */}
                <div className="py-4 px-2 overflow-x-auto custom-scrollbar">
                    <div className="flex space-x-2 px-3">
                        {weekDates.map((date) => {
                            const isSelected = isSameDay(date, selectedDate);
                            return (
                                <button
                                    key={date.toString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "flex flex-col items-center justify-center min-w-[56px] h-20 rounded-2xl transition-all duration-300",
                                        isSelected ? "bg-mindbody text-white shadow-lg shadow-pink-200" : "bg-slate-50 text-slate-500"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase mb-1">{format(date, 'eee')}</span>
                                    <span className="text-lg font-black">{format(date, 'd')}</span>
                                </button>
                            );
                        })}
                        <div className="min-w-[56px] h-20 flex items-center justify-center text-slate-300">
                            <CalendarDays size={24} />
                        </div>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="pb-4 overflow-x-auto custom-scrollbar">
                    <div className="flex space-x-2 px-5">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all whitespace-nowrap",
                                    activeCategory === cat
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Class List */}
            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{format(selectedDate, 'MMMM d, EEEE')}</span>
                    <button className="text-slate-400 hover:text-slate-600">
                        <Filter size={18} />
                    </button>
                </div>

                <AnimatePresence mode="popLayout">
                    {CLASSES.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center"
                        >
                            {/* Time Column */}
                            <div className="pr-4 border-r border-slate-50 flex flex-col items-center justify-center min-w-[70px]">
                                <span className="text-xl font-black text-slate-800 leading-none">{cls.startTime.split(':')[0]}</span>
                                <span className="text-xs font-bold text-slate-400">{cls.startTime.split(':')[1]} AM</span>
                            </div>

                            {/* Info Column */}
                            <div className="flex-1 px-4 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                        {cls.category}
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

                            {/* Action Column */}
                            <div className="pl-2">
                                {cls.status === 'booked' ? (
                                    <button className="w-20 h-10 rounded-2xl border-2 border-emerald-500 text-emerald-500 flex items-center justify-center font-bold text-sm bg-emerald-50 transition-transform active:scale-95">
                                        <CheckCircle2 size={16} className="mr-1" />
                                        已訂
                                    </button>
                                ) : cls.status === 'waitlist' ? (
                                    <button
                                        onClick={() => handleBooking(cls)}
                                        className="w-20 h-10 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-transform active:scale-95"
                                    >
                                        候補
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleBooking(cls)}
                                        className="w-20 h-10 rounded-2xl bg-mindbody text-white flex items-center justify-center font-bold text-sm shadow-md shadow-pink-100 transition-transform active:scale-95"
                                    >
                                        預約
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Simple Bottom Tab Bar for Mobile feel */}
            <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-slate-100 px-8 py-3 flex justify-between items-center z-40">
                <TabItem icon={<CalendarDays size={20} />} label="預約" active />
                <TabItem icon={<Clock size={20} />} label="行程" />
                <TabItem icon={<Bell size={20} />} label="探索" />
                <TabItem icon={<CheckCircle2 size={20} />} label="帳號" />
            </footer>
        </div>
    );
};

const TabItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <button className={cn(
        "flex flex-col items-center space-y-1 transition-colors",
        active ? "text-mindbody" : "text-slate-300 hover:text-slate-500"
    )}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);
