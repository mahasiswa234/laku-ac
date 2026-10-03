import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogIn,
  MessageCircle,
  User,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { COMPANY_INFO } from '../config/companyInfo.js';
import ThemeToggle from './ThemeToggle';

export default function PublicLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (_) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsOpen(false);
    navigate('/login');
  };

  const getDashboardUrl = () => {
    if (!currentUser) return '/login';

    if (currentUser.role === 'admin') {
      return '/admin/dashboard';
    }

    if (currentUser.role === 'technician') {
      return '/teknisi/jadwal';
    }

    return '/pelanggan/dashboard';
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Layanan', path: '/layanan' },
    { name: 'Harga', path: '/harga' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Kontak', path: '/kontak' }
  ];

  return (
    <div
      className="
        min-h-screen
        flex flex-col
        bg-slate-50 dark:bg-black
        font-sans
        text-slate-800 dark:text-white
        transition-colors duration-300
      "
    >

      {/* =====================================================
          HEADER
      ====================================================== */}
      <header
        className="
          sticky top-0 z-50
          bg-white/50 dark:bg-black/50
          backdrop-blur-md
          border-b border-slate-200/70 dark:border-white/10
          shadow-sm
          transition-colors duration-300
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between h-16 items-center">

            {/* =================================================
                LOGO
            ================================================== */}
            <Link
              to="/"
              className="flex-shrink-0 flex items-center"
            >
              <img
                src="/logo.png"
                alt="LAKU AC"
                className="h-12 w-auto object-contain"
              />
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================== */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    px-2 py-2
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      location.pathname === link.path
                        ? `
                          text-blue-600
                          dark:text-blue-400
                          font-semibold
                        `
                        : `
                          text-slate-600
                          dark:text-slate-300
                          hover:text-blue-600
                          dark:hover:text-blue-400
                        `
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}

            </nav>

            {/* =================================================
                DESKTOP ACTIONS
            ================================================== */}
            <div className="hidden md:flex items-center gap-3">

              {/* Theme Toggle */}
              <ThemeToggle />

              {currentUser ? (
                <>
                  {/* Dashboard */}
                  <Link
                    to={getDashboardUrl()}
                    className="
                      flex items-center gap-1.5
                      bg-blue-50 dark:bg-white/10
                      text-blue-700 dark:text-blue-300
                      hover:bg-blue-100 dark:hover:bg-white/15
                      px-3.5 py-2
                      rounded-lg
                      text-sm font-bold
                      transition-colors
                    "
                  >
                    <User size={16} />
                    <span>
                      Dashboard ({currentUser.role})
                    </span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="
                      flex items-center gap-1.5
                      text-slate-500 dark:text-slate-400
                      hover:text-rose-600 dark:hover:text-rose-400
                      px-3 py-2
                      rounded-lg
                      text-sm font-semibold
                      hover:bg-slate-100 dark:hover:bg-white/10
                      transition-colors
                    "
                    title="Keluar"
                  >
                    <LogOut size={16} />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Pesan Servis */}
                  <Link
                    to="/layanan"
                    className="
                      bg-blue-50 dark:bg-white/10
                      text-blue-700 dark:text-blue-300
                      hover:bg-blue-100 dark:hover:bg-white/15
                      px-4 py-2
                      rounded-lg
                      text-sm font-semibold
                      transition-colors
                    "
                  >
                    Pesan Servis
                  </Link>

                  {/* Login */}
                  <Link
                    to="/login"
                    className="
                      flex items-center gap-2
                      bg-blue-600
                      hover:bg-blue-700
                      dark:bg-blue-500
                      dark:hover:bg-blue-600
                      text-white
                      px-4 py-2
                      rounded-lg
                      text-sm font-medium
                      transition-colors
                      shadow-sm
                    "
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                </>
              )}

            </div>

            {/* =================================================
                MOBILE HEADER ACTIONS
            ================================================== */}
            <div className="md:hidden flex items-center gap-2">

              <ThemeToggle />

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="
                  text-slate-600 dark:text-slate-300
                  hover:text-blue-600 dark:hover:text-blue-400
                  focus:outline-none
                  p-1
                  transition-colors
                "
                aria-label="Buka menu"
              >
                {isOpen ? (
                  <X size={24} />
                ) : (
                  <Menu size={24} />
                )}
              </button>

            </div>

          </div>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}
        {isOpen && (
          <div
            className="
              md:hidden
              bg-white/95 dark:bg-black/95
              backdrop-blur-md
              border-t border-slate-200 dark:border-white/10
              shadow-lg
              transition-colors duration-300
            "
          >
            <div className="px-3 pt-2 pb-4 space-y-1 sm:px-3">

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    block
                    px-3 py-2
                    rounded-md
                    text-base
                    font-medium
                    transition-colors
                    ${
                      location.pathname === link.path
                        ? `
                          text-blue-600
                          dark:text-blue-400
                          bg-blue-50
                          dark:bg-white/10
                        `
                        : `
                          text-slate-700
                          dark:text-slate-300
                          hover:text-blue-600
                          dark:hover:text-blue-400
                          hover:bg-slate-50
                          dark:hover:bg-white/5
                        `
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile User Actions */}
              <div
                className="
                  pt-3
                  flex flex-col gap-2
                  border-t border-slate-200 dark:border-white/10
                  mt-2
                "
              >

                {currentUser ? (
                  <>
                    {/* Dashboard */}
                    <Link
                      to={getDashboardUrl()}
                      onClick={() => setIsOpen(false)}
                      className="
                        w-full
                        text-center
                        bg-blue-600 dark:bg-blue-500
                        hover:bg-blue-700 dark:hover:bg-blue-600
                        text-white
                        font-bold
                        py-2.5
                        rounded-lg
                        shadow-sm
                        flex items-center justify-center gap-2
                        text-sm
                        transition-colors
                      "
                    >
                      <User size={16} />
                      Masuk ke Dashboard ({currentUser.role})
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="
                        w-full
                        text-center
                        text-rose-600 dark:text-rose-400
                        bg-rose-50 dark:bg-rose-950/40
                        hover:bg-rose-100 dark:hover:bg-rose-950/60
                        font-semibold
                        py-2
                        rounded-lg
                        text-sm
                        flex items-center justify-center gap-2
                        transition-colors
                      "
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    {/* Pesan Servis */}
                    <Link
                      to="/layanan"
                      onClick={() => setIsOpen(false)}
                      className="
                        w-full
                        text-center
                        bg-blue-50 dark:bg-white/10
                        text-blue-700 dark:text-blue-300
                        hover:bg-blue-100 dark:hover:bg-white/15
                        font-semibold
                        py-2
                        rounded-lg
                        text-sm
                        transition-colors
                      "
                    >
                      Pesan Servis
                    </Link>

                    {/* Login */}
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="
                        w-full
                        flex justify-center items-center gap-2
                        bg-blue-600 dark:bg-blue-500
                        hover:bg-blue-700 dark:hover:bg-blue-600
                        text-white
                        font-medium
                        py-2
                        rounded-lg
                        text-sm
                        transition-colors
                      "
                    >
                      <LogIn size={18} />
                      Login
                    </Link>
                  </>
                )}

              </div>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main
        className="
          flex-grow
          bg-slate-50 dark:bg-black
          transition-colors duration-300
        "
      >
        <Outlet />
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer
        className="
          bg-white dark:bg-black
          text-slate-800 dark:text-white
          py-12
          mt-auto
          border-t border-slate-200 dark:border-white/10
          transition-colors duration-300
        "
      >
        <div
          className="
            max-w-7xl mx-auto
            px-4 sm:px-6 lg:px-8
            grid grid-cols-1 md:grid-cols-3
            gap-8
          "
        >

          {/* =================================================
              FOOTER LOGO & DESCRIPTION
          ================================================== */}
          <div>

            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="LAKU AC"
                className="h-12 w-auto object-contain"
              />
            </div>

            <p
              className="
                text-slate-600
                dark:text-slate-400
                text-sm
                leading-relaxed
              "
            >
              Sistem Informasi Manajemen Servis dan
              Pemeliharaan Air Conditioner (AC).
              Melayani pembersihan, perbaikan, dan
              pemasangan AC dengan teknisi tersertifikasi.
            </p>

          </div>

          {/* =================================================
              KONTAK
          ================================================== */}
          <div>

            <h3
              className="
                font-semibold
                text-lg
                mb-4
                text-slate-800
                dark:text-slate-200
              "
            >
              Kontak Informasi
            </h3>

            <ul
              className="
                space-y-2
                text-sm
                text-slate-600
                dark:text-slate-400
              "
            >
              <li>
                📞 {COMPANY_INFO.phone}
              </li>

              <li>
                💬 WhatsApp: {COMPANY_INFO.phone}
              </li>

              <li>
                📧 Email: {COMPANY_INFO.email}
              </li>

              <li>
                📍 Alamat: {COMPANY_INFO.address}
              </li>
            </ul>

          </div>

          {/* =================================================
              AREA & JAM OPERASIONAL
          ================================================== */}
          <div>

            <h3
              className="
                font-semibold
                text-lg
                mb-4
                text-slate-800
                dark:text-slate-200
              "
            >
              Area & Jam Operasional
            </h3>

            <p
              className="
                text-sm
                text-slate-600
                dark:text-slate-400
                mb-2
              "
            >
              Jam Operasional:
              <br />

              <span
                className="
                  text-slate-700
                  dark:text-slate-300
                "
              >
                08.00 - 20.00
              </span>
            </p>

            <p
              className="
                text-sm
                text-slate-600
                dark:text-slate-400
              "
            >
              Area Layanan:
              <br />

              <Link
                to="/layanan#area-jabodetabek"
                className="
                  text-blue-600
                  dark:text-blue-400
                  hover:text-blue-700
                  dark:hover:text-blue-300
                  underline
                  font-medium
                  transition-colors
                "
              >
                Jabodetabek
              </Link>
            </p>

          </div>

        </div>

      {/* =====================================================
    COPYRIGHT
====================================================== */}
<div
  className="
    max-w-7xl mx-auto
    px-4 sm:px-6 lg:px-8
    mt-8 pt-6
    border-t border-slate-200 dark:border-white/10
    flex items-center justify-center
    text-sm
  "
>
  <p
    className="
      text-slate-500
      dark:text-slate-400
      text-center
    "
  >
    &copy; {new Date().getFullYear()} {COMPANY_INFO.name}.
    All Rights Reserved.
  </p>
</div>
      </footer>

      {/* =====================================================
          FLOATING WHATSAPP
      ====================================================== */}
      <a
        href="https://wa.me/6281314022911"
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed
          bottom-6
          right-6
          bg-[#25D366]
          text-white
          p-4
          rounded-full
          shadow-xl
          hover:bg-[#1EBE5A]
          hover:scale-110
          transition-all
          z-50
          flex
          items-center
          justify-center
          group
        "
        aria-label="Chat via WhatsApp"
      >

        <MessageCircle size={28} />

        <span
          className="
            max-w-0
            overflow-hidden
            group-hover:max-w-xs
            transition-all
            duration-300
            ease-in-out
            whitespace-nowrap
            opacity-0
            group-hover:opacity-100
            font-medium
            group-hover:ml-2
          "
        >
          Chat WhatsApp
        </span>

      </a>

    </div>
  );
}