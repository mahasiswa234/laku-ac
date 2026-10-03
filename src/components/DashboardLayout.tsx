import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  User,
  LayoutDashboard,
  Calendar,
  Wrench,
  Settings,
  ClipboardList,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  verifyServerSession,
  clearAuthSession,
  getAuthToken
} from '../utils/auth';
import { COMPANY_INFO } from '../config/companyInfo.js';
import ThemeToggle from './ThemeToggle';

export default function DashboardLayout({
  role = 'customer'
}: {
  role?: 'admin' | 'technician' | 'customer';
}) {
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
            message:
              'Akses ditolak: Anda harus login terlebih dahulu untuk mengakses dashboard.',
            redirectTo: location.pathname
          }
        });

        return;
      }

      // 2. Validasi token JWT ke backend API
      try {
        const result = await verifyServerSession(role);

        if (!isMounted) return;

        if (!result.valid) {
          clearAuthSession();

          setIsAuthorized(false);

          setAuthError(
            result.message ||
              'Sesi otentikasi tidak valid atau telah kedaluwarsa.'
          );

          navigate('/login', {
            replace: true,
            state: {
              message:
                result.message ||
                'Sesi Anda telah kedaluwarsa atau tidak sah. Silakan login kembali.',
              redirectTo: location.pathname
            }
          });

          return;
        }

        // 3. Verifikasi role pengguna
        const user = result.user;

        if (user && user.role !== role) {
          setIsAuthorized(false);

          // Alihkan ke dashboard sesuai role
          if (user.role === 'admin') {
            navigate('/admin/dashboard', {
              replace: true
            });
          } else if (user.role === 'technician') {
            navigate('/teknisi/jadwal', {
              replace: true
            });
          } else {
            navigate('/pelanggan/dashboard', {
              replace: true
            });
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
            message:
              'Terjadi kegagalan verifikasi keamanan sesi. Silakan masuk kembali.',
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
    navigate('/login', {
      replace: true
    });
  };

  const getMenu = () => {
    switch (role) {
      case 'admin':
        return [
          {
            name: 'Ringkasan',
            icon: LayoutDashboard,
            path: '/admin/dashboard'
          },
          {
            name: 'Pesanan & Jadwal',
            icon: Calendar,
            path: '/admin/pesanan'
          },
          {
            name: 'Teknisi',
            icon: Wrench,
            path: '/admin/teknisi'
          },
          {
            name: 'Pelanggan',
            icon: User,
            path: '/admin/pelanggan'
          },
          {
            name: 'Layanan & Harga',
            icon: Settings,
            path: '/admin/layanan'
          },
          {
            name: 'Pengaturan Akun',
            icon: UserCog,
            path: '/admin/pengaturan'
          }
        ];

      case 'technician':
        return [
          {
            name: 'Jadwal Hari Ini',
            icon: Calendar,
            path: '/teknisi/jadwal'
          },
          {
            name: 'Riwayat Servis',
            icon: ClipboardList,
            path: '/teknisi/riwayat'
          },
          {
            name: 'Pengaturan Akun',
            icon: UserCog,
            path: '/teknisi/pengaturan'
          }
        ];

      default:
        return [
          {
            name: 'Dashboard Saya',
            icon: LayoutDashboard,
            path: '/pelanggan/dashboard'
          },
          {
            name: 'Buat Pesanan',
            icon: Calendar,
            path: '/pelanggan/pesan'
          },
          {
            name: 'Unit AC Saya',
            icon: Settings,
            path: '/pelanggan/unit'
          },
          {
            name: 'Pengaturan Akun',
            icon: UserCog,
            path: '/pelanggan/pengaturan'
          }
        ];
    }
  };

  // ===============================
  // LOADING / AUTHENTICATION CHECK
  // ===============================
  if (isAuthorized === null || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-black flex items-center justify-center p-4 transition-colors duration-300">

        <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80 dark:border-white/10 max-w-sm w-full text-center space-y-4 transition-colors duration-300">

          <div className="relative w-12 h-12 mx-auto">

            <div className="w-12 h-12 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>

            <div className="absolute inset-0 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wrench size={18} />
            </div>

          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Verifikasi Keamanan...
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Memvalidasi token otentikasi JWT dan hak akses dashboard...
            </p>
          </div>

        </div>

      </div>
    );
  }

  const menuItems = getMenu();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex transition-colors duration-300">

      {/* =======================================
          SIDEBAR DESKTOP
      ======================================== */}
      <aside
        className="
          w-64
          bg-white text-slate-700
          dark:bg-black dark:text-white
          border-r border-slate-200 dark:border-white/10
          hidden md:flex flex-col
          transition-colors duration-300
        "
      >

        {/* LOGO SIDEBAR */}
        <div
          className="
            h-16 flex items-center px-6
            border-b border-slate-200 dark:border-white/10
            transition-colors duration-300
          "
        >
          <Link
            to="/"
            className="flex items-center"
          >
            <img
              src="/logo.png"
              alt="LAKU AC"
              className="h-11 w-auto object-contain"
            />
          </Link>
        </div>

        {/* USER INFORMATION */}
        <div
          className="
            p-4
            border-b border-slate-200 dark:border-white/10
            transition-colors duration-300
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                w-10 h-10
                bg-slate-100 text-slate-600
                dark:bg-black dark:text-white
                rounded-full
                flex items-center justify-center
                transition-colors duration-300
              "
            >
              <User size={20} />
            </div>

            <div className="min-w-0">

              <p className="text-sm font-medium truncate text-slate-800 dark:text-white">
                {userData
                  ? userData.email.split('@')[0]
                  : 'Pengguna'}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {role}
              </p>

            </div>

          </div>

        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 py-6 space-y-2">

          {menuItems.map((item, idx) => {

            const isActive =
              location.pathname === item.path;

            return (
              <Link
                key={idx}
                to={item.path}
                className={`
                  flex items-center gap-3
                  px-3 py-2
                  rounded-lg
                  transition-colors duration-300
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : `
                        text-slate-600
                        hover:text-blue-600
                        hover:bg-blue-50
                        dark:text-slate-300
                        dark:hover:text-white
                        dark:hover:bg-black
                      `
                  }
                `}
              >

                <item.icon size={18} />

                <span className="text-sm font-medium">
                  {item.name}
                </span>

              </Link>
            );
          })}

        </nav>

        {/* SIDEBAR BOTTOM */}
        <div
          className="
            p-4
            border-t border-slate-200 dark:border-white/10
            space-y-2
            transition-colors duration-300
          "
        >

          <div className="flex items-center justify-between px-1">

            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tampilan
            </span>

            <ThemeToggle />

          </div>

          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3
              px-3 py-2
              w-full
              text-slate-600
              hover:text-red-500
              hover:bg-red-50
              dark:text-slate-300
              dark:hover:text-red-400
              dark:hover:bg-black
              rounded-lg
              transition-colors duration-300
            "
          >

            <LogOut size={18} />

            <span className="text-sm font-medium">
              Keluar
            </span>

          </button>

        </div>

      </aside>

      {/* =======================================
          MAIN CONTENT AREA
      ======================================== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* =====================================
            MOBILE HEADER
        ====================================== */}
        <header
          className="
            h-16
            bg-white dark:bg-black
            dark:border-white/10
            shadow-xs
            border-b border-slate-200
            flex items-center justify-between
            px-4 md:hidden
            transition-colors duration-300
          "
        >

          <div className="flex items-center gap-2.5">

            {/* LOGO MOBILE */}
            <Link
              to="/"
              className="flex items-center"
            >
              <img
                src="/logo.png"
                alt="LAKU AC"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                {COMPANY_INFO.name}
              </span>

              <span className="text-[10px] text-slate-400 block -mt-0.5 capitalize">
                {role} Panel
              </span>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="
                p-2
                text-slate-600
                dark:text-slate-300
                hover:text-blue-600
                dark:hover:text-blue-400
                hover:bg-slate-100
                dark:hover:bg-black
                rounded-lg
                transition-colors duration-300
              "
              aria-label="Buka Menu"
            >
              <Menu size={22} />
            </button>

          </div>

        </header>

        {/* =====================================
            MOBILE DRAWER
        ====================================== */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">

            {/* Overlay */}
            <div
              className="
                fixed inset-0
                bg-slate-900/60
                dark:bg-black/70
                backdrop-blur-xs
                transition-opacity
              "
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div
              className="
                relative
                w-4/5 max-w-xs
                bg-white text-slate-700
                dark:bg-black dark:text-white
                h-full
                flex flex-col
                z-10
                shadow-2xl
                transition-colors duration-300
              "
            >

              {/* Drawer Header */}
              <div
                className="
                  h-16
                  flex items-center justify-between
                  px-6
                  border-b border-slate-200
                  dark:border-white/10
                  transition-colors duration-300
                "
              >

                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <img
                    src="/logo.png"
                    alt="LAKU AC"
                    className="h-10 w-auto object-contain"
                  />
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="
                    text-slate-500
                    dark:text-slate-400
                    hover:text-slate-800
                    dark:hover:text-white
                    hover:bg-slate-100
                    dark:hover:bg-black
                    p-1
                    rounded-lg
                    transition-colors duration-300
                  "
                  aria-label="Tutup Menu"
                >
                  <X size={20} />
                </button>

              </div>

              {/* Mobile User */}
              <div
                className="
                  p-4
                  border-b border-slate-200
                  bg-slate-50
                  dark:border-white/10
                  dark:bg-black
                  transition-colors duration-300
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-10 h-10
                      bg-slate-100 text-slate-600
                      dark:bg-black dark:text-slate-200
                      rounded-full
                      flex items-center justify-center
                      transition-colors duration-300
                    "
                  >
                    <User size={20} />
                  </div>

                  <div className="min-w-0">

                    <p
                      className="
                        text-sm font-semibold truncate
                        text-slate-800
                        dark:text-white
                      "
                    >
                      {userData
                        ? userData.email.split('@')[0]
                        : 'Pengguna'}
                    </p>

                    <p className="text-xs text-blue-600 dark:text-blue-400 capitalize font-medium">
                      {role}
                    </p>

                  </div>

                </div>

              </div>

              {/* Mobile Menu */}
              <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">

                {menuItems.map((item, idx) => {

                  const isActive =
                    location.pathname === item.path;

                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3
                        px-3 py-2.5
                        rounded-xl
                        transition-colors duration-300
                        ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : `
                              text-slate-600
                              hover:text-blue-600
                              hover:bg-blue-50
                              dark:text-slate-300
                              dark:hover:text-white
                              dark:hover:bg-black
                            `
                        }
                      `}
                    >

                      <item.icon size={18} />

                      <span className="text-sm">
                        {item.name}
                      </span>

                    </Link>
                  );
                })}

              </nav>

              {/* Mobile Logout */}
              <div
                className="
                  p-4
                  border-t border-slate-200
                  dark:border-white/10
                  transition-colors duration-300
                "
              >

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="
                    flex items-center gap-3
                    px-3 py-2.5
                    w-full
                    text-rose-500
                    hover:text-rose-600
                    hover:bg-rose-50
                    dark:text-rose-400
                    dark:hover:text-rose-300
                    dark:hover:bg-rose-950/40
                    rounded-xl
                    transition-colors duration-300
                    text-sm font-semibold
                  "
                >

                  <LogOut size={18} />

                  <span>
                    Keluar
                  </span>

                </button>

              </div>

            </div>

          </div>
        )}

        {/* =====================================
            PAGE CONTENT
        ====================================== */}
        <main
          className="
            flex-1
            p-4 sm:p-6
            overflow-auto
            bg-slate-50
            dark:bg-black
            text-slate-800
            dark:text-slate-100
            transition-colors duration-300
          "
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}