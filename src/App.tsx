import { useState, useEffect } from 'react'
import { AdminPanel } from './components/AdminPanel'
import { ClientBooking } from './components/ClientBooking'
import { MemberProfile } from './components/MemberProfile'
import { LayoutDashboard, ShoppingCart, User, LogOut, Loader2 } from 'lucide-react'
import { supabase } from './lib/supabase'

function App() {
  const [activeTab, setActiveTab] = useState<'admin' | 'client' | 'member'>('admin');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberData, setMemberData] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check if user info is in localStorage (simple simulation)
  useEffect(() => {
    const savedMember = localStorage.getItem('mindbody_member');
    if (savedMember) {
      const data = JSON.parse(savedMember);
      setMemberData(data);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', memberEmail)
        .single();

      if (error || !data) {
        alert('找不到此 Email 的會員資料，請檢查後再試。');
      } else {
        setMemberData(data);
        setIsLoggedIn(true);
        localStorage.setItem('mindbody_member', JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert('登入發生錯誤');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mindbody_member');
    setIsLoggedIn(false);
    setMemberData(null);
    setMemberEmail('');
    setActiveTab('client'); // Redirect to booking landing
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* View Switcher Overlay (for demo purposes) */}
      <div className="fixed bottom-6 right-6 z-[100] bg-white/90 backdrop-blur shadow-2xl border border-slate-200 rounded-2xl p-2 flex space-x-2 items-center">
        <button
          onClick={() => setActiveTab('admin')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-mindbody text-white' : 'text-slate-400 hover:bg-slate-100'}`}
          title="管理者後台"
        >
          <LayoutDashboard size={20} />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <button
          onClick={() => setActiveTab('client')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'client' ? 'bg-mindbody text-white' : 'text-slate-400 hover:bg-slate-100'}`}
          title="學員預約端"
        >
          <ShoppingCart size={20} />
        </button>
        <button
          onClick={() => setActiveTab('member')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'member' ? 'bg-mindbody text-white' : 'text-slate-400 hover:bg-slate-100'}`}
          title="會員中心"
        >
          <User size={20} />
        </button>
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="p-3 rounded-xl text-red-400 hover:bg-red-50 transition-all"
            title="登出"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>

      {/* Views */}
      {activeTab === 'admin' && <AdminPanel />}

      {activeTab === 'client' && (
        isLoggedIn ? (
          <ClientBooking memberId={memberData.id} />
        ) : (
          <div className="flex items-center justify-center min-h-screen p-6">
            <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-pink-50 text-mindbody rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">會員登入</h1>
                <p className="text-slate-400 text-sm">請輸入您的註冊 Email 開始預約課程</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  required
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-mindbody/20 transition-all font-medium"
                />
                <button
                  disabled={isLoggingIn}
                  className="w-full bg-mindbody text-white py-4 rounded-2xl font-bold shadow-lg shadow-mindbody/20 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center space-x-2"
                >
                  {isLoggingIn && <Loader2 size={20} className="animate-spin" />}
                  <span>登入系統</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-300">
                  模擬用帳號: xiaoming@example.com (密碼: 免)
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {activeTab === 'member' && (
        isLoggedIn ? (
          <MemberProfile memberId={memberData.id} />
        ) : (
          <div className="flex items-center justify-center min-h-screen p-6 text-center">
            <div className="space-y-4">
              <p className="text-slate-400 font-medium">請先登入後方可查看個人資料</p>
              <button
                onClick={() => setActiveTab('client')}
                className="px-6 py-2 bg-mindbody/10 text-mindbody rounded-full font-bold text-sm"
              >
                前往登入
              </button>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default App
