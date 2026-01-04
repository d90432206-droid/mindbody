import React, { useState } from 'react';
import { Construction } from 'lucide-react';
import { AdminSchedule } from './AdminSchedule';
import { AdminDashboard } from './AdminDashboard';
import { AdminMemberList } from './AdminMemberList';
import { Sidebar, type AdminTab } from './Sidebar';

const ComingSoon = ({ title }: { title: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 space-y-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center max-w-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                <Construction size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title} 模組開發中</h3>
            <p className="text-sm font-medium leading-relaxed">我們正在火速趕工此項功能，讓您的健身房管理更輕鬆。敬請期待！</p>
            <button className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-all uppercase tracking-widest">
                訂閱更新通知
            </button>
        </div>
    </div>
);

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 flex flex-col min-w-0 overflow-auto custom-scrollbar">
                {activeTab === 'overview' && <AdminDashboard />}
                {activeTab === 'scheduling' && (
                    <div className="flex-1 flex flex-col min-h-0">
                        <AdminSchedule hideSidebar />
                    </div>
                )}
                {activeTab === 'members' && <AdminMemberList />}
                {activeTab === 'sales' && <ComingSoon title="銷售與訂單" />}
                {activeTab === 'settings' && <ComingSoon title="系統設定" />}
            </div>
        </div>
    );
};
