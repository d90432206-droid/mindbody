import React, { useState, useEffect } from 'react';
import {
    Award,
    Calendar,
    ChevronRight,
    CreditCard,
    History,
    Settings,
    Star,
    Trophy,
    XCircle,
    Zap,
    Loader2,
    CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';

// --- Types ---
interface MemberProfileProps {
    memberId: string;
}

interface UpcomingClass {
    id: string;
    name: string;
    date: string;
    time: string;
    teacher: string;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({ memberId }) => {
    const [member, setMember] = useState<any>(null);
    const [upcoming, setUpcoming] = useState<UpcomingClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch member basic info
            const { data: memberData, error: memberError } = await supabase
                .from('members')
                .select('*')
                .eq('id', memberId)
                .single();
            if (memberError) throw memberError;
            setMember(memberData);

            // 2. Fetch upcoming classes (bookings + sessions)
            const today = new Date().toISOString();
            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .select(`
                    id,
                    class_sessions (
                        id,
                        start_time,
                        classes (
                            name,
                            teacher_name
                        )
                    )
                `)
                .eq('member_id', memberId)
                .gte('class_sessions.start_time', today);

            if (bookingError) throw bookingError;

            // Filter out cases where class_sessions might be null due to inner join simulation
            const formatted: UpcomingClass[] = (bookingData || [])
                .filter((b: any) => b.class_sessions)
                .map((b: any) => ({
                    id: b.id,
                    name: b.class_sessions.classes.name,
                    date: format(parseISO(b.class_sessions.start_time), 'MMM dd'),
                    time: format(parseISO(b.class_sessions.start_time), 'HH:mm'),
                    teacher: b.class_sessions.classes.teacher_name
                }));

            setUpcoming(formatted);
        } catch (error) {
            console.error('Error fetching member data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [memberId]);

    if (isLoading && !member) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-gold" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans max-w-md mx-auto pb-10 overflow-x-hidden">
            {/* Header / Hero */}
            <section className="relative px-6 pt-12 pb-8 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gold opacity-10 blur-3xl rounded-full"></div>

                <div className="flex items-center space-x-5 relative z-10">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-2 border-gold p-1">
                            <img
                                src={`https://ui-avatars.com/api/?name=${member?.name || 'User'}&background=000&color=D4AF37`}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-gold text-black p-1 rounded-full shadow-lg">
                            <Star size={14} fill="currentColor" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">{member?.name}</h2>
                        <p className="text-zinc-500 text-sm font-medium">
                            {member?.status} Member since {member?.join_date ? format(parseISO(member.join_date), 'MMM yyyy') : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2 text-gold mb-1">
                            <Zap size={16} fill="currentColor" />
                            <span className="text-xs font-black uppercase tracking-widest">Power Level</span>
                        </div>
                        <span className="text-2xl font-black">Lvl {Math.floor((member?.total_sessions || 0) / 5) + 1}</span>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2 text-gold mb-1">
                            <Trophy size={16} fill="currentColor" />
                            <span className="text-xs font-black uppercase tracking-widest">Completed</span>
                        </div>
                        <span className="text-2xl font-black">{member?.total_sessions - member?.remaining_sessions}</span>
                    </div>
                </div>
            </section>

            {/* Wallet Section */}
            <section className="py-6">
                <div className="px-6 flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Your Wallet</h3>
                </div>

                <div className="flex overflow-x-auto space-x-4 px-6 no-scrollbar pb-4 snap-x">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="min-w-[280px] h-44 rounded-[2rem] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/5 snap-center bg-gradient-to-br from-zinc-800 to-black"
                    >
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h4 className="font-bold text-zinc-400 text-xs uppercase tracking-widest">Premium Pass</h4>
                                <p className="text-lg font-black text-white mt-1">瑜珈團體課點數卡</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                <CreditCard size={20} className="text-zinc-300" />
                            </div>
                        </div>

                        <div className="flex justify-between items-end relative z-10">
                            <div>
                                <span className="text-4xl font-black tracking-tighter">{member?.remaining_sessions}</span>
                                <span className="text-zinc-500 text-sm font-bold ml-2">/ {member?.total_sessions} sessions</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Expires</p>
                                <p className="text-xs font-black text-gold">2024-12-31</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Upcoming Classes */}
            <section className="px-6 py-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Upcoming Schedule</h3>
                <div className="space-y-3">
                    {upcoming.length === 0 ? (
                        <div className="p-10 border border-zinc-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-zinc-600 space-y-2">
                            <CalendarDays size={32} />
                            <p className="text-xs font-bold uppercase tracking-wider">No upcoming classes</p>
                        </div>
                    ) : (
                        upcoming.map((item) => (
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
                        ))
                    )}
                </div>
            </section>

            {/* Monthly Stats */}
            <section className="px-6 py-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Monthly Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={<Calendar size={20} />} label="Total Visits" value={(member?.total_sessions - member?.remaining_sessions).toString()} trend="+2" />
                    <StatCard icon={<Award size={20} />} label="Last Visit" value={member?.last_visit === '-' ? 'N/A' : member?.last_visit} trend="---" />
                </div>
            </section>

            {/* Bottom Actions */}
            <section className="px-6 mt-4 space-y-2 pb-10">
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
            </section>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) => (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-all"></div>
        <div className="text-zinc-500 mb-3">{icon}</div>
        <p className="text-2xl font-black mb-1 italic tracking-tighter truncate">{value}</p>
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</span>
            <span className="text-[10px] font-black text-emerald-500">{trend}</span>
        </div>
    </div>
);
