import React, { useState } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Filter,
    Download,
    Mail,
    X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Member {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Expired' | 'Pending';
    remainingSessions: number;
    totalSessions: number;
    joinDate: string;
    lastVisit: string;
}

const MOCK_MEMBERS: Member[] = [
    { id: 'm1', name: 'Alex Chen', email: 'alex.chen@example.com', status: 'Active', remainingSessions: 6, totalSessions: 10, joinDate: '2023-10-12', lastVisit: '2024-01-02' },
    { id: 'm2', name: 'Emily Wilson', email: 'emily.w@example.com', status: 'Active', remainingSessions: 2, totalSessions: 12, joinDate: '2023-08-05', lastVisit: '2024-01-03' },
    { id: 'm3', name: 'James Rodriguez', email: 'james.r@demo.com', status: 'Expired', remainingSessions: 0, totalSessions: 10, joinDate: '2023-01-15', lastVisit: '2023-12-20' },
    { id: 'm4', name: 'Sophia Lee', email: 'sophia.lee@yoga.com', status: 'Active', remainingSessions: 15, totalSessions: 20, joinDate: '2023-11-30', lastVisit: '2024-01-01' },
    { id: 'm5', name: 'Liam Brown', email: 'liam.b@test.com', status: 'Pending', remainingSessions: 0, totalSessions: 0, joinDate: '2024-01-04', lastVisit: '-' },
];

export const AdminMemberList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
                        placeholder="搜尋姓名、Email 或 電話..."
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
                        {MOCK_MEMBERS.map((member) => (
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
                                        <span className="text-sm font-bold text-slate-800">{member.remainingSessions}</span>
                                        <div className="flex-1 w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full",
                                                    member.remainingSessions < 3 ? "bg-red-500" : "bg-mindbody"
                                                )}
                                                style={{ width: `${(member.remainingSessions / member.totalSessions) * 100 || 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">/ {member.totalSessions}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-500">{member.lastVisit}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-500">{member.joinDate}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-mindbody hover:bg-pink-50 rounded-lg transition-all"><Mail size={18} /></button>
                                        <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"><MoreVertical size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination placeholder */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">目前顯示 1 - 5 筆，共 1,280 筆會員</p>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 disabled:opacity-50">上一頁</button>
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">下一頁</button>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">新增會員</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">姓名</label>
                                <input type="text" placeholder="例如: 王小明" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                <input type="email" placeholder="example@email.com" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">初始方案</label>
                                <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-mindbody/20 appearance-none">
                                    <option>單次體驗</option>
                                    <option>10 堂團體課</option>
                                    <option>20 堂團體課</option>
                                    <option>1對1 私人訓練</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-full bg-mindbody text-white py-4 rounded-2xl font-bold shadow-lg shadow-mindbody/20 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all mt-4"
                            >
                                建立會員資料
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
