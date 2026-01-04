import { useState } from 'react'
import { AdminPanel } from './components/AdminPanel'
import { ClientBooking } from './components/ClientBooking'
import { MemberProfile } from './components/MemberProfile'
import { LayoutDashboard, ShoppingCart, User } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'admin' | 'client' | 'member'>('admin');

  return (
    <div className="relative min-h-screen">
      {/* View Switcher Overlay (for demo purposes) */}
      <div className="fixed bottom-6 right-6 z-[100] bg-white/90 backdrop-blur shadow-2xl border border-slate-200 rounded-full p-2 flex space-x-2">
        <button
          onClick={() => setActiveTab('admin')}
          className={`p-3 rounded-full transition-all ${activeTab === 'admin' ? 'bg-mindbody text-white' : 'text-slate-400 hover:bg-slate-100'}`}
          title="管理者後台"
        >
          <LayoutDashboard size={24} />
        </button>
        <button
          onClick={() => setActiveTab('client')}
          className={`p-3 rounded-full transition-all ${activeTab === 'client' ? 'bg-mindbody text-white' : 'text-slate-400 hover:bg-slate-100'}`}
          title="學員預約端"
        >
          <ShoppingCart size={24} />
        </button>
        <button
          onClick={() => setActiveTab('member')}
          className={`p-3 rounded-full transition-all ${activeTab === 'member' ? 'bg-mindbody text-white' : 'text-slate-400 hover:bg-slate-100'}`}
          title="會員中心"
        >
          <User size={24} />
        </button>
      </div>

      {/* Views */}
      {activeTab === 'admin' && <AdminPanel />}
      {activeTab === 'client' && <ClientBooking />}
      {activeTab === 'member' && <MemberProfile />}
    </div>
  )
}

export default App
