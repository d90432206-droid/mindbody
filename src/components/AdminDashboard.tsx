import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    UserCheck,
    Star,
    Award,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

// Simple SVG Line Chart Component
const MiniChart = () => {
    const points = "0,80 50,60 100,70 150,40 200,50 250,20 300,30 350,10 400,20";
    return (
        <div className="w-full h-40 mt-4 relative">
            <svg viewBox="0 0 400 100" className="w-full h-full">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#E31C5F" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#E31C5F" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`M ${points} L 400,100 L 0,100 Z`}
                    fill="url(#gradient)"
                />
                <motion.path
                    d={`M ${points}`}
                    fill="none"
                    stroke="#E31C5F"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
            </svg>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState([
        { label: '實時營收', value: '$42,500', trend: '+12.5%', isUp: true, icon: <DollarSign className="text-emerald-500" /> },
        { label: '本週預約', value: '0', trend: '+8.2%', isUp: true, icon: <UserCheck className="text-blue-500" /> },
        { label: '活躍會員', value: '0', trend: '+2.4%', isUp: true, icon: <Users className="text-indigo-500" /> },
        { label: '平均滿意度', value: '4.9', trend: '+0.1%', isUp: true, icon: <TrendingUp className="text-orange-500" /> },
    ]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                // Fetch member count
                const { count: memberCount } = await supabase
                    .from('members')
                    .select('*', { count: 'exact', head: true });

                // Fetch booking count
                const { count: bookingCount } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true });

                setStats(prev => [
                    prev[0],
                    { ...prev[1], value: bookingCount?.toString() || '0' },
                    { ...prev[2], value: memberCount?.toString() || '0' },
                    prev[3]
                ]);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const TEACHERS = [
        { name: 'Sarah Jenkins', category: 'Yoga', rating: 4.9, bookings: 42, growth: '+15%' },
        { name: 'Mike Thompson', category: 'Pilates', rating: 4.8, bookings: 38, growth: '+10%' },
        { name: 'Anna White', category: 'HIIT', rating: 4.9, bookings: 35, growth: '+22%' },
        { name: 'David Lee', category: 'Strength', rating: 4.7, bookings: 31, growth: '+5%' },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">數據總覽</h2>
                    <p className="text-slate-500 text-sm">歡迎回來，這是您目前的健身房經營現況。</p>
                </div>
                {isLoading && <Loader2 className="animate-spin text-mindbody" size={24} />}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
                            <div className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.isUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Card */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">預約人數趨勢 (本週)</h3>
                        <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-1.5 focus:ring-0">
                            <option>最近 7 天</option>
                            <option>最近 30 天</option>
                        </select>
                    </div>
                    <MiniChart />
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                        <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                    </div>
                </div>

                {/* Top Teachers List */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">熱門老師排名</h3>
                        <Award size={20} className="text-gold" />
                    </div>
                    <div className="space-y-5">
                        {TEACHERS.map((teacher, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                                            {teacher.name.charAt(0)}
                                        </div>
                                        {i === 0 && (
                                            <div className="absolute -top-1 -right-1 bg-gold text-white p-0.5 rounded-full ring-2 ring-white">
                                                <Star size={10} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-mindbody transition-colors">{teacher.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">{teacher.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">{teacher.bookings} 預約</p>
                                    <p className="text-xs text-emerald-500 font-bold">{teacher.growth}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                        查看更多數據
                    </button>
                </div>
            </div>
        </div>
    );
};
