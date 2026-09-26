import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Wrench, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isExpiredParam = searchParams.get('expired') === '1';
  const flashMessage = location.state?.message || (isExpiredParam ? 'Sesi Anda telah kedaluwarsa. Silakan login kembali.' : null);
  const isWarningMessage = flashMessage && (
    flashMessage.includes('Akses ditolak') || 
    flashMessage.includes('kedaluwarsa') || 
    flashMessage.includes('tidak sah') ||
    flashMessage.includes('harus login')
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      let data; const contentType = res.headers.get("content-type"); if (contentType && contentType.includes("application/json")) { data = await res.json(); } else { const text = await res.text(); throw new Error("Backend returned non-JSON: " + text.substring(0, 100)); }
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const redirectTo = location.state?.redirectTo;
        if (data.user.role === 'admin') {
          navigate(redirectTo && redirectTo.startsWith('/admin') ? redirectTo : '/admin/dashboard');
        } else if (data.user.role === 'technician') {
          navigate(redirectTo && redirectTo.startsWith('/teknisi') ? redirectTo : '/teknisi/jadwal');
        } else {
          navigate(redirectTo && redirectTo.startsWith('/pelanggan') ? redirectTo : '/pelanggan/dashboard');
        }
      } else {
        setError(data.message || 'Login gagal. Periksa email dan password Anda.');
      }
    } catch (err) {
      console.error('Koneksi ke backend gagal', err);
      setError('Tidak dapat terhubung ke server database. Pastikan MySQL sudah menyala.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
            <Wrench size={28} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-2">Masuk ke Sistem</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Silakan masuk menggunakan akun Anda</p>

        {flashMessage && (
          <div className={`p-3.5 rounded-xl text-sm mb-5 flex items-start gap-2.5 border ${
            isWarningMessage 
              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800' 
              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          }`}>
            {isWarningMessage ? (
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{flashMessage}</span>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 p-3.5 rounded-xl text-sm mb-5 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Demo Accounts Quick-Fill */}
       

       
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="email@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors">
            Masuk
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Belum punya akun? <Link to="/daftar" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
