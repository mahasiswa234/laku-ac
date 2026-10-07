import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogIn,
  MessageCircle,
  User,
  LogOut,
  ChevronDown
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
    { name: 'Produk', path: '/produk' },
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
           <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
  {navLinks.map((link) => {
    const isActive =
      location.pathname === link.path ||
      (link.name === 'Produk' &&
        (location.pathname.startsWith('/produk') ||
          location.pathname === '/harga'));

    if (link.name === 'Produk') {
      return (
        <div key={link.name} className="relative group">
          {/* PRODUK */}
          <Link
            to="/produk"
            className={`
              group/link
              relative
              inline-flex
              items-center
              gap-1
              px-3
              py-2
              text-sm
              font-medium
              transition-all
              duration-300
              ease-out
              hover:translate-x-1
              ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300'
              }
            `}
          >
            <span
              className="
                absolute
                left-0
                bottom-0
                h-0.5
                w-0
                rounded-full
                bg-blue-600
                dark:bg-blue-400
                transition-all
                duration-300
                group-hover/link:w-full
              "
            />

            <span
              className="
                transition-colors
                duration-300
                group-hover/link:text-blue-600
                dark:group-hover/link:text-blue-400
              "
            >
              Produk
            </span>

            <ChevronDown
              size={14}
              className="
                transition-all
                duration-300
                group-hover/link:rotate-180
                group-hover/link:text-blue-600
                dark:group-hover/link:text-blue-400
              "
            />
          </Link>

          {/* DROPDOWN PRODUK */}
          <div
            className="
              absolute
              left-0
              top-full
              z-50
              pt-2
              invisible
              opacity-0
              translate-y-2
              scale-95
              pointer-events-none
              transition-all
              duration-200
              ease-out
              group-hover:visible
              group-hover:opacity-100
              group-hover:translate-y-0
              group-hover:scale-100
              group-hover:pointer-events-auto
            "
          >
            <div
              className="
                w-52
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                p-1.5
                shadow-xl
                dark:border-white/10
                dark:bg-black
              "
            >
              {/* UNIT INDOOR */}
              <Link
                to="/produk?kategori=indoor"
                className="
                  group/item
                  flex
                  items-center
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  transition-all
                  duration-200
                  hover:translate-x-1
                  hover:bg-blue-50
                  hover:text-blue-600
                  dark:text-slate-300
                  dark:hover:bg-white/10
                  dark:hover:text-blue-400
                "
              >
                <span
                  className="
                    mr-2
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-slate-300
                    transition-all
                    duration-200
                    group-hover/item:bg-blue-600
                    group-hover/item:scale-125
                    dark:bg-slate-600
                    dark:group-hover/item:bg-blue-400
                  "
                />
                Unit Indoor
              </Link>

              {/* UNIT OUTDOOR */}
              <Link
                to="/produk?kategori=outdoor"
                className="
                  group/item
                  flex
                  items-center
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  transition-all
                  duration-200
                  hover:translate-x-1
                  hover:bg-blue-50
                  hover:text-blue-600
                  dark:text-slate-300
                  dark:hover:bg-white/10
                  dark:hover:text-blue-400
                "
              >
                <span
                  className="
                    mr-2
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-slate-300
                    transition-all
                    duration-200
                    group-hover/item:bg-blue-600
                    group-hover/item:scale-125
                    dark:bg-slate-600
                    dark:group-hover/item:bg-blue-400
                  "
                />
                Unit Outdoor
              </Link>

              {/* FREON */}
              <Link
                to="/produk?kategori=freon"
                className="
                  group/item
                  flex
                  items-center
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  transition-all
                  duration-200
                  hover:translate-x-1
                  hover:bg-blue-50
                  hover:text-blue-600
                  dark:text-slate-300
                  dark:hover:bg-white/10
                  dark:hover:text-blue-400
                "
              >
                <span
                  className="
                    mr-2
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-slate-300
                    transition-all
                    duration-200
                    group-hover/item:bg-blue-600
                    group-hover/item:scale-125
                    dark:bg-slate-600
                    dark:group-hover/item:bg-blue-400
                  "
                />
                Freon
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={link.name}
        to={link.path}
        className={`
          group
          relative
          px-3
          py-2
          text-sm
          font-medium
          transition-all
          duration-300
          ease-out
          hover:translate-x-1
          ${
            isActive
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-600 dark:text-slate-300'
          }
        `}
      >
        {/* GARIS ANIMASI DARI KIRI KE KANAN */}
        <span
          className="
            absolute
            left-0
            bottom-0
            h-0.5
            w-0
            rounded-full
            bg-blue-600
            dark:bg-blue-400
            transition-all
            duration-300
            group-hover:w-full
          "
        />

        {/* TEKS */}
        <span
          className="
            inline-block
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:text-blue-600
            dark:group-hover:text-blue-400
          "
        >
          {link.name}
        </span>
      </Link>
    );
  })}
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

      {navLinks.map((link, index) =>
        link.name === 'Produk' ? (
          /* =================================================
             PRODUK MOBILE DROPDOWN
          ================================================== */
          <details
            key={link.name}
            className="group"
          >
            <summary
              className="
                relative
                flex
                items-center
                justify-between
                overflow-hidden
                px-3
                py-3
                rounded-xl
                text-base
                font-medium
                text-slate-700
                dark:text-slate-300
                cursor-pointer
                list-none
                transition-all
                duration-300
                ease-out
                hover:translate-x-2
                hover:text-blue-600
                dark:hover:text-blue-400
                hover:bg-blue-50
                dark:hover:bg-white/5
              "
            >
              <span
                className="
                  relative
                  z-10
                  transition-transform
                  duration-300
                  group-hover:translate-x-2
                "
              >
                Produk
              </span>

              <ChevronDown
                size={18}
                className="
                  relative
                  z-10
                  transition-transform
                  duration-300
                  group-open:rotate-180
                "
              />
            </summary>

            {/* SUBMENU PRODUK */}
            <div
              className="
                ml-3
                mt-1
                pl-3
                border-l
                border-blue-200
                dark:border-white/10
                space-y-1
              "
            >
              <Link
                to="/produk?kategori=indoor"
                onClick={() => setIsOpen(false)}
                className="
                  group
                  block
                  px-3
                  py-2.5
                  rounded-lg
                  text-sm
                  text-slate-600
                  dark:text-slate-300
                  transition-all
                  duration-300
                  hover:translate-x-2
                  hover:text-blue-600
                  dark:hover:text-blue-400
                  hover:bg-blue-50
                  dark:hover:bg-white/5
                "
              >
                <span className="transition-transform duration-300">
                  Unit Indoor
                </span>
              </Link>

              <Link
                to="/produk?kategori=outdoor"
                onClick={() => setIsOpen(false)}
                className="
                  group
                  block
                  px-3
                  py-2.5
                  rounded-lg
                  text-sm
                  text-slate-600
                  dark:text-slate-300
                  transition-all
                  duration-300
                  hover:translate-x-2
                  hover:text-blue-600
                  dark:hover:text-blue-400
                  hover:bg-blue-50
                  dark:hover:bg-white/5
                "
              >
                <span className="transition-transform duration-300">
                  Unit Outdoor
                </span>
              </Link>

              <Link
                to="/produk?kategori=freon"
                onClick={() => setIsOpen(false)}
                className="
                  group
                  block
                  px-3
                  py-2.5
                  rounded-lg
                  text-sm
                  text-slate-600
                  dark:text-slate-300
                  transition-all
                  duration-300
                  hover:translate-x-2
                  hover:text-blue-600
                  dark:hover:text-blue-400
                  hover:bg-blue-50
                  dark:hover:bg-white/5
                "
              >
                <span className="transition-transform duration-300">
                  Freon
                </span>
              </Link>
            </div>
          </details>
        ) : (
          /* =================================================
             MENU LAIN
          ================================================== */
          <Link
            key={link.name}
            to={link.path}
            onClick={() => setIsOpen(false)}
            style={{
              transitionDelay: `${index * 40}ms`,
            }}
            className={`
              group
              relative
              block
              overflow-hidden
              px-3
              py-3
              rounded-xl
              text-base
              font-medium
              transition-all
              duration-300
              ease-out
              hover:translate-x-2
              hover:text-blue-600
              dark:hover:text-blue-400

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
                    hover:bg-blue-50
                    dark:hover:bg-white/5
                  `
              }
            `}
          >
            {/* Background slide */}
            <span
              className="
                absolute
                inset-y-0
                left-0
                w-0
                bg-blue-50
                dark:bg-white/10
                group-hover:w-full
                transition-all
                duration-300
                ease-out
              "
            />

            {/* Garis kiri */}
            <span
              className="
                absolute
                left-0
                top-1/2
                -translate-y-1/2
                h-0
                w-1
                rounded-full
                bg-blue-600
                dark:bg-blue-400
                group-hover:h-8
                transition-all
                duration-300
                ease-out
              "
            />

            {/* Nama menu */}
            <span
              className="
                relative
                z-10
                inline-block
                transition-transform
                duration-300
                group-hover:translate-x-2
              "
            >
              {link.name}
            </span>
          </Link>
        )
      )}

      {/* =================================================
          MOBILE USER ACTIONS
      ================================================== */}
      <div
        className="
          pt-3
          mt-2
          flex
          flex-col
          gap-2
          border-t
          border-slate-200
          dark:border-white/10
        "
      >
        {currentUser ? (
          <>
            <Link
              to={getDashboardUrl()}
              onClick={() => setIsOpen(false)}
              className="
                w-full
                text-center
                bg-blue-600
                dark:bg-blue-500
                hover:bg-blue-700
                dark:hover:bg-blue-600
                text-white
                font-bold
                py-2.5
                rounded-lg
                shadow-sm
                flex
                items-center
                justify-center
                gap-2
                text-sm
                transition-all
                duration-300
                hover:translate-x-1
              "
            >
              <User size={16} />
              Masuk ke Dashboard ({currentUser.role})
            </Link>

            <button
              onClick={handleLogout}
              className="
                w-full
                text-center
                text-rose-600
                dark:text-rose-400
                bg-rose-50
                dark:bg-rose-950/40
                hover:bg-rose-100
                dark:hover:bg-rose-950/60
                font-semibold
                py-2
                rounded-lg
                text-sm
                flex
                items-center
                justify-center
                gap-2
                transition-all
                duration-300
                hover:translate-x-1
              "
            >
              <LogOut size={16} />
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link
              to="/layanan"
              onClick={() => setIsOpen(false)}
              className="
                w-full
                text-center
                bg-blue-50
                dark:bg-white/10
                text-blue-700
                dark:text-blue-300
                hover:bg-blue-100
                dark:hover:bg-white/15
                font-semibold
                py-2
                rounded-lg
                text-sm
                transition-all
                duration-300
                hover:translate-x-1
              "
            >
              Pesan Servis
            </Link>

            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="
                w-full
                flex
                justify-center
                items-center
                gap-2
                bg-blue-600
                dark:bg-blue-500
                hover:bg-blue-700
                dark:hover:bg-blue-600
                text-white
                font-medium
                py-2
                rounded-lg
                text-sm
                transition-all
                duration-300
                hover:translate-x-1
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