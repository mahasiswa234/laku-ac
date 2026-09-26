import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Menu, X, LogIn, MessageCircle, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { COMPANY_INFO } from '../config/companyInfo';
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
    navigate('/login');
  };

  const getDashboardUrl = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'technician') return '/teknisi/jadwal';
    return '/pelanggan/dashboard';
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Layanan', path: '/layanan' },
    { name: 'Harga', path: '/harga' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Kontak', path: '/kontak' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <header className="bg-white dark:bg-slate-900 dark:border-b dark:border-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                <Wrench size={20} />
              </div>
              <span className="font-bold text-xl text-blue-900 dark:text-blue-300">{COMPANY_INFO.name}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-blue-600'
                  } px-2 py-2 text-sm font-medium transition-colors`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {currentUser ? (
                <>
                  <Link 
                    to={getDashboardUrl()} 
                    className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3.5 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    <User size={16} />
                    <span>Dashboard ({currentUser.role})</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    title="Keluar"
                  >
                    <LogOut size={16} />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/layanan" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Pesan Servis
                  </Link>
                  <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs">
                    <LogIn size={16} />
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none p-1">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg">
            <div className="px-3 pt-2 pb-4 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-950"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                {currentUser ? (
                  <>
                    <Link 
                      to={getDashboardUrl()} 
                      onClick={() => setIsOpen(false)} 
                      className="w-full text-center bg-blue-600 text-white font-bold py-2.5 rounded-lg shadow-xs flex items-center justify-center gap-2 text-sm"
                    >
                      <User size={16} />
                      Masuk ke Dashboard ({currentUser.role})
                    </Link>
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }} 
                      className="w-full text-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/layanan" onClick={() => setIsOpen(false)} className="w-full text-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold py-2 rounded-lg text-sm">
                      Pesan Servis
                    </Link>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-medium py-2 rounded-lg text-sm">
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

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                <Wrench size={20} />
              </div>
              <span className="font-bold text-xl">{COMPANY_INFO.name}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sistem Informasi Manajemen Servis dan Pemeliharaan Air Conditioner (AC). Melayani pembersihan, perbaikan, dan pemasangan AC dengan teknisi tersertifikasi.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-200">Kontak Informasi</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📞 {COMPANY_INFO.phone}</li>
              <li>💬 WhatsApp: {COMPANY_INFO.phone}</li>
              <li>📧 Email: {COMPANY_INFO.email}</li>
              <li>📍 Alamat: {COMPANY_INFO.address}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-200">Area & Jam Operasional</h3>
            <p className="text-sm text-slate-400 mb-2">Jam Operasional: <br/><span className="text-slate-300">08.00 - 20.00</span></p>
            <p className="text-sm text-slate-400">Area Layanan: <br/><Link to="/layanan#area-jabodetabek" className="text-blue-400 hover:text-blue-300 underline font-medium">Jabodetabek</Link></p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {COMPANY_INFO.name}. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:bg-[#1EBE5A] hover:scale-110 transition-all z-50 flex items-center justify-center group"
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle size={28} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 font-medium group-hover:ml-2">
          Chat WhatsApp
        </span>
      </a>
    </div>
  );
}
