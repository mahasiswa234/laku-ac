import React, { useEffect, useState } from 'react';
import { UserCog, Mail, Phone, MapPin, Wrench, Lock, Save, Loader2, CheckCircle2, ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface ProfileData {
  id: number;
  email: string;
  role: 'admin' | 'technician' | 'customer';
  created_at?: string;
  profile: {
    full_name?: string;
    phone?: string;
    address?: string;
    skills?: string;
    status?: string;
  } | null;
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrator',
  technician: 'Teknisi',
  customer: 'Pelanggan',
};

export default function AccountSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ProfileData | null>(null);
  const [profileForm, setProfileForm] = useState({ email: '', full_name: '', phone: '', address: '', skills: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileBanner, setProfileBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordBanner, setPasswordBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/profile');
      const json = await res.json();
      if (res.ok) {
        setData(json);
        setProfileForm({
          email: json.email || '',
          full_name: json.profile?.full_name || '',
          phone: json.profile?.phone || '',
          address: json.profile?.address || '',
          skills: json.profile?.skills || '',
        });
      } else {
        setProfileBanner({ type: 'error', message: json.message || 'Gagal memuat data profil' });
      }
    } catch (err) {
      setProfileBanner({ type: 'error', message: 'Tidak dapat terhubung ke server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileBanner(null);
    setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const json = await res.json();
      if (res.ok) {
        setProfileBanner({ type: 'success', message: json.message || 'Profil berhasil diperbarui' });
        // Sinkronkan email pada data user tersimpan di localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.email = profileForm.email;
            localStorage.setItem('user', JSON.stringify(parsed));
          } catch (_) {}
        }
        fetchProfile();
      } else {
        setProfileBanner({ type: 'error', message: json.message || 'Gagal memperbarui profil' });
      }
    } catch (err) {
      setProfileBanner({ type: 'error', message: 'Tidak dapat terhubung ke server.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordBanner(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordBanner({ type: 'error', message: 'Konfirmasi password baru tidak cocok' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordBanner({ type: 'error', message: 'Password baru minimal 6 karakter' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setPasswordBanner({ type: 'success', message: json.message || 'Password berhasil diperbarui' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordBanner({ type: 'error', message: json.message || 'Gagal memperbarui password' });
      }
    } catch (err) {
      setPasswordBanner({ type: 'error', message: 'Tidak dapat terhubung ke server.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  const role = data?.role || 'customer';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <UserCog size={28} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Pengaturan Akun</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola informasi profil dan keamanan akun {ROLE_LABEL[role] || role} Anda.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UserCog size={18} className="text-blue-600 dark:text-blue-400" />
          Informasi Profil
        </h2>

        {profileBanner && (
          <div className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 border ${
            profileBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}>
            {profileBanner.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />}
            <span className="font-medium leading-relaxed">{profileBanner.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {(role === 'customer' || role === 'technician') && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {role === 'customer' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={3}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {role === 'technician' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keahlian</label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cth: AC Split, AC Inverter"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {role === 'admin' && (
          <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5">
            Akun administrator hanya mengelola alamat email login. Data operasional lain dikelola melalui menu masing-masing.
          </p>
        )}

        <button
          type="submit"
          disabled={profileSaving}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg transition-colors"
        >
          {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </button>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Lock size={18} className="text-blue-600 dark:text-blue-400" />
          Ubah Password
        </h2>

        {passwordBanner && (
          <div className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 border ${
            passwordBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}>
            {passwordBanner.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />}
            <span className="font-medium leading-relaxed">{passwordBanner.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password Saat Ini</label>
          <input
            type={showPasswords ? 'text' : 'password'}
            required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password Baru</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Konfirmasi Password Baru</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPasswords ? 'Sembunyikan password' : 'Tampilkan password'}
        </button>

        <button
          type="submit"
          disabled={passwordSaving}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg transition-colors"
        >
          {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Perbarui Password
        </button>
      </form>
    </div>
  );
}
