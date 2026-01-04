import React from 'react';
import {
    Award,
    Calendar,
    ChevronRight,
    CreditCard,
    History,
    LogOut,
    Settings,
    Star,
    Trophy,
    XCircle,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Types ---
interface Pass {
    id: string;
    name: string;
    remaining: number;
    total: number;
    expiresAt: string;
    type: 'Group' | 'Private' | 'Workshop';
    gradient: string;
}

interface UpcomingClass {
    id: string;
    name: string;
    date: string;
    time: string;
    teacher: string;
}

// --- Mock Data ---
const PASSES: Pass[] = [
    { id: 'p1', name: 'Premium Group Pass', remaining: 6, total: 10, expiresAt: '2024-12-31', type: 'Group', gradient: 'from-zinc-800 to-black' },
    { id: 'p2', name: 'Private Pilates Session', remaining: 1, total: 3, expiresAt: '2024-11-20', type: 'Private', gradient: 'from-zinc-900 via-zinc-800 to-zinc-900' },
    { id: 'p3', name: 'Meditation Workshop', remaining: 1, total: 1, expiresAt: '2024-10-31', type: 'Workshop', gradient: 'from-stone-800 to-stone-950' },
];

const UPCOMING: UpcomingClass[] = [
    { id: 'u1', name: 'Hatha Flow Yoga', date: 'Oct 24', time: '08:00 AM', teacher: 'Sarah Jenkins' },
    { id: 'u2', name: 'Intermediate Reformer', date: 'Oct 26', time: '10:30 AM', teacher: 'Mike Thompson' },
    { id: 'u3', name: 'Core Blitz HIIT', date: 'Oct 27', time: '06:00 PM', teacher: 'Anna White' },
];

export const MemberProfile: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white font-sans max-w-md mx-auto pb-10 overflow-x-hidden">
            {/* Header / Hero */}
            <section className="relative px-6 pt-12 pb-8 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gold opacity-10 blur-3xl rounded-full"></div>

                <div className="flex items-center space-x-5 relative z-10">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-2 border-gold p-1">
                            <img
                                src="https://ui-avatars.com/api/?name=Alex+Chen&background=000&color=D4AF37"
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-gold text-black p-1 rounded-full shadow-lg">
                            <Star size={14} fill="currentColor" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Alex Chen</h2>
                        <p className="text-zinc-500 text-sm font-medium">Gold Member since Oct 2023</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2 text-gold mb-1">
                            <Zap size={16} fill="currentColor" />
                            <span className="text-xs font-black uppercase tracking-widest">Power Level</span>
                        </div>
                        <span className="text-2xl font-black">Lvl 12</span>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2 text-gold mb-1">
                            <Trophy size={16} fill="currentColor" />
                            <span className="text-xs font-black uppercase tracking-widest">Achievements</span>
                        </div>
                        <span className="text-2xl font-black">24</span>
                    </div>
                </div>
            </section>

            {/* Wallet Section */}
            <section className="py-6">
                <div className="px-6 flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Your Wallet</h3>
                    <button className="text-xs font-bold text-gold hover:underline flex items-center">
                        View All <ChevronRight size={14} />
                    </button>
                </div>

                <div className="flex overflow-x-auto space-x-4 px-6 custom-scrollbar pb-4 snap-x">
                    {PASSES.map((pass) => (
                        <motion.div
                            key={pass.id}
                            whileHover={{ y: -5 }}
                            className={cn(
                                "min-w-[280px] h-44 rounded-[2rem] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/5 snap-center bg-gradient-to-br",
                                pass.gradient
                            )}
                        >
                            {/* Card Decoration */}
                            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h4 className="font-bold text-zinc-400 text-xs uppercase tracking-widest">{pass.type} Pass</h4>
                                    <p className="text-lg font-black text-white mt-1">{pass.name}</p>
                                </div>
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                    <CreditCard size={20} className="text-zinc-300" />
                                </div>
                            </div>

                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <span className="text-4xl font-black tracking-tighter">{pass.remaining}</span>
                                    <span className="text-zinc-500 text-sm font-bold ml-2">/ {pass.total} sessions</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Expires</p>
                                    <p className="text-xs font-black text-gold">{pass.expiresAt}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Upcoming Classes */}
            <section className="px-6 py-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Upcoming Schedule</h3>
                <div className="space-y-3">
                    {UPCOMING.map((item) => (
                        <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-black border border-zinc-800 rounded-2xl flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase">{item.date.split(' ')[0]}</span>
                                    <span className="text-sm font-black text-gold">{item.date.split(' ')[1]}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                                    <p className="text-xs text-zinc-500 font-medium mt-1">{item.time} • {item.teacher}</p>
                                </div>
                            </div>
                            <button className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Achievements / Stats Grid */}
            <section className="px-6 py-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Monthly Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={<Calendar size={20} />} label="Total Hours" value="12.5h" trend="+15%" />
                    <StatCard icon={<Award size={20} />} label="Check-ins" value="18" trend="+2" />
                </div>
            </section>

            {/* Bottom Actions */}
            <section className="px-6 mt-4 space-y-2">
                <button className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between px-6 py-4 rounded-2xl transition-all">
                    <div className="flex items-center space-x-3">
                        <History size={20} className="text-zinc-500" />
                        <span className="font-bold text-sm">Class History</span>
                    </div>
                    <ChevronRight size={18} className="text-zinc-700" />
                </button>
                <button className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between px-6 py-4 rounded-2xl transition-all">
                    <div className="flex items-center space-x-3">
                        <Settings size={20} className="text-zinc-500" />
                        <span className="font-bold text-sm">Account Settings</span>
                    </div>
                    <ChevronRight size={18} className="text-zinc-700" />
                </button>
                <button className="w-full text-zinc-600 font-bold text-sm py-4 mt-4 flex items-center justify-center space-x-2">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </section>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) => (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-all"></div>
        <div className="text-zinc-500 mb-3">{icon}</div>
        <p className="text-2xl font-black mb-1 italic tracking-tighter">{value}</p>
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</span>
            <span className="text-[10px] font-black text-emerald-500">{trend}</span>
        </div>
    </div>
);
