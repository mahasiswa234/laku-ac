import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Calendar, Wrench, Settings, ClipboardList, Menu, X, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { verifyServerSession, clearAuthSession, getAuthToken } from '../utils/auth';
import { COMPANY_INFO } from '../config/companyInfo.js';
import ThemeToggle from './ThemeToggle';

export default function DashboardLayout({ role = 'customer' }: { role?: 'admin' | 'technician' | 'customer' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    let isMounted = true;

    async function checkSessionSecurity() {
      // 1. Cek keberadaan token lokal
      const token = getAuthToken();
      if (!token) {
        if (!isMounted) return;
        setIsAuthorized(false);
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Akses ditolak: Anda harus login terlebih dahulu untuk mengakses dashboard.',
            redirectTo: location.pathname 
          } 
        });
        return;
      }

      // 2. Validasi keabsahan token JWT ke backend API (/api/auth/verify)
      try {
        const result = await verifyServerSession(role);

        if (!isMounted) return;

        if (!result.valid) {
          clearAuthSession();
          setIsAuthorized(false);
          setAuthError(result.message || 'Sesi otentikasi tidak valid atau telah kedaluwarsa.');
          
          navigate('/login', { 
            replace: true,
            state: { 
              message: result.message || 'Sesi Anda telah kedaluwarsa atau tidak sah. Silakan login kembali.',
              redirectTo: location.pathname 
            } 
          });
          return;
        }

        // 3. Verifikasi role pengguna
        const user = result.user;
        if (user && user.role !== role) {
          setIsAuthorized(false);
          // Alihkan ke dashboard sesuai perannya yang sah
          if (user.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (user.role === 'technician') {
            navigate('/teknisi/jadwal', { replace: true });
          } else {
            navigate('/pelanggan/dashboard', { replace: true });
          }
          return;
        }

        setUserData(user);
        setIsAuthorized(true);
      } catch (err: any) {
        if (!isMounted) return;
        clearAuthSession();
        setIsAuthorized(false);
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Terjadi kegagalan verifikasi keamanan sesi. Silakan masuk kembali.',
            redirectTo: location.pathname 
          } 
        });
      }
    }

    checkSessionSecurity();

    return () => {
      isMounted = false;
    };
  }, [role, navigate, location.pathname]);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const getMenu = () => {
    switch(role) {
      case 'admin':
        return [
          { name: 'Ringkasan', icon: LayoutDashboard, path: '/admin/dashboard' },
          { name: 'Pesanan & Jadwal', icon: Calendar, path: '/admin/pesanan' },
          { name: 'Teknisi', icon: Wrench, path: '/admin/teknisi' },
          { name: 'Pelanggan', icon: User, path: '/admin/pelanggan' },
          { name: 'Layanan & Harga', icon: Settings, path: '/admin/layanan' },
        ];
      case 'technician':
        return [
          { name: 'Jadwal Hari Ini', icon: Calendar, path: '/teknisi/jadwal' },
          { name: 'Riwayat Servis', icon: ClipboardList, path: '/teknisi/riwayat' },
        ];
      default:
        return [
          { name: 'Dashboard Saya', icon: LayoutDashboard, path: '/pelanggan/dashboard' },
          { name: 'Buat Pesanan', icon: Calendar, path: '/pelanggan/pesan' },
          { name: 'Unit AC Saya', icon: Settings, path: '/pelanggan/unit' },
        ];
    }
  };

  if (isAuthorized === null || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80 max-w-sm w-full text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="w-12 h-12 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
              <Wrench size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Verifikasi Keamanan Sesi</h3>
            <p className="text-xs text-slate-500 mt-1">
              Memvalidasi token otentikasi JWT dan hak akses dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = getMenu();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Wrench className="w-6 h-6 text-blue-500 mr-2" />
          <span className="font-bold text-lg">{COMPANY_INFO.name}</span>
        </div>
        
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">{userData ? userData.email.split('@')[0] : 'Pengguna'}</p>
              <p className="text-xs text-slate-400 capitalize">{role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={idx} 
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-400">Tampilan</span>
            <ThemeToggle />
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xs border-b border-slate-200 flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
              <Wrench size={18} />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{COMPANY_INFO.name}</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 capitalize">{role} Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Buka Menu"
            >
              <Menu size={22}/>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar / Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-slate-900 text-white h-full flex flex-col z-10 shadow-2xl">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-blue-500" />
                  <span className="font-bold text-base">{COMPANY_INFO.name}</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                  aria-label="Tutup Menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 border-b border-slate-800 bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-200">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold truncate text-white">{userData ? userData.email.split('@')[0] : 'Pengguna'}</p>
                    <p className="text-xs text-blue-400 capitalize font-medium">{role}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                {menuItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={idx} 
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                    >
                      <item.icon size={18} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }} 
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors text-sm font-semibold"
                >
                  <LogOut size={18} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        <main className="flex-1 p-4 sm:p-6 overflow-auto dark:bg-slate-950 dark:text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
