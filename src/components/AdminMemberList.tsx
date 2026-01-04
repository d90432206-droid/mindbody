import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Filter,
    Download,
    Mail,
    X,
    Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Member {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Expired' | 'Pending';
    remaining_sessions: number;
    total_sessions: number;
    join_date: string;
    last_visit: string;
}

export const AdminMemberList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPlan, setNewPlan] = useState('10 堂團體課');

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMembers(data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const totalSessions = newPlan.includes('10') ? 10 : newPlan.includes('20') ? 20 : 1;

        try {
            const { error } = await supabase
                .from('members')
                .insert([{
                    name: newName,
                    email: newEmail,
                    status: 'Active',
                    total_sessions: totalSessions,
                    remaining_sessions: totalSessions,
                    join_date: new Date().toISOString().split('T')[0]
                }]);

            if (error) throw error;

            setIsAddModalOpen(false);
            setNewName('');
            setNewEmail('');
            fetchMembers();
        } catch (error) {
            console.error('Error adding member:', error);
            alert('新增失敗，請檢查資料或 Email 是否重複。');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">會員管理</h2>
                    <p className="text-slate-500 text-sm">管理您的健身房會員、會籍狀態與堂數。</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center">
                        <Download size={18} className="mr-2" />
                        導出報表
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-mindbody text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center active:scale-95"
                    >
                        <Plus size={18} className="mr-2" />
                        新增會員
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="搜尋姓名、Email ..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold text-slate-800">全部</button>
                        <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">活躍</button>
                        <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">已過期</button>
                    </div>
                    <button className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Member Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">會員名稱</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">會籍狀態</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">剩餘堂數</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">最後到訪</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">入會日期</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center space-y-3">
                                        <Loader2 className="animate-spin text-mindbody" size={32} />
                                        <p className="text-sm font-medium text-slate-400">載入會員資料中...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 text-sm">
                                    找不到相符的會員資料
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            member.status === 'Active' ? "bg-emerald-100 text-emerald-600" :
                                                member.status === 'Expired' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-bold text-slate-800">{member.remaining_sessions}</span>
                                            <div className="flex-1 w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        member.remaining_sessions < 3 ? "bg-red-500" : "bg-mindbody"
                                                    )}
                                                    style={{ width: `${(member.remaining_sessions / member.total_sessions) * 100 || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">/ {member.total_sessions}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{member.last_visit}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{member.join_date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-mindbody hover:bg-pink-50 rounded-lg transition-all"><Mail size={18} /></button>
                                            <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"><MoreVertical size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination placeholder */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">
                        目前顯示 {filteredMembers.length} 筆，共 {members.length} 筆會員
                    </p>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 disabled:opacity-50">上一頁</button>
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">下一頁</button>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <form onSubmit={handleAddMember} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">新增會員</h3>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">姓名</label>
                                <input
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    type="text"
                                    placeholder="例如: 王小明"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                <input
                                    required
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    type="email"
                                    placeholder="example@email.com"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">初始方案</label>
                                <select
                                    value={newPlan}
                                    onChange={(e) => setNewPlan(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20 appearance-none"
                                >
                                    <option>單次體驗 (1 堂)</option>
                                    <option>10 堂團體課</option>
                                    <option>20 堂團體課</option>
                                    <option>1對1 私人訓練 (10 堂)</option>
                                </select>
                            </div>
                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full bg-mindbody text-white py-4 rounded-2xl font-bold shadow-lg shadow-mindbody/20 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 transition-all mt-4 flex items-center justify-center space-x-2"
                            >
                                {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                                <span>建立會員資料</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
