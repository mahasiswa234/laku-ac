/**
 * Layanan dialog kustom (pengganti window.alert / window.confirm bawaan browser).
 * Bisa dipanggil dari mana saja (tanpa hook):
 *
 *   showAlert('Data berhasil disimpan!');                       // tipe terdeteksi otomatis
 *   showAlert('Gagal menyimpan', { type: 'error' });
 *   if (!(await showConfirm('Hapus data ini?', { variant: 'danger' }))) return;
 *
 * Tampilannya dirender oleh <DialogHost /> (dipasang sekali di App.tsx).
 */

export type DialogType = 'success' | 'error' | 'warning' | 'info';

export interface AlertOptions {
  title?: string;
  type?: DialogType;
  buttonText?: string;
}

export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  /** 'danger' = tombol merah (hapus), 'default' = tombol biru */
  variant?: 'default' | 'danger';
}

export type DialogItem =
  | { id: number; kind: 'alert'; message: string; type: DialogType; title: string; buttonText: string; resolve: () => void }
  | { id: number; kind: 'confirm'; message: string; title: string; confirmText: string; cancelText: string; variant: 'default' | 'danger'; resolve: (v: boolean) => void };

let queue: DialogItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

export function subscribeDialogs(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getDialogQueue(): DialogItem[] {
  return queue;
}

export function closeDialog(id: number, result?: boolean) {
  const item = queue.find(d => d.id === id);
  if (!item) return;
  queue = queue.filter(d => d.id !== id);
  emit();
  if (item.kind === 'confirm') item.resolve(!!result);
  else item.resolve();
}

/** Menebak jenis pesan dari isi teksnya agar pemanggilan lama alert('...') tetap benar warnanya. */
function inferType(message: string): DialogType {
  const m = message.toLowerCase();
  if (/(gagal|terjadi kesalahan|tidak dapat|tidak bisa|error|ditolak|tidak valid|tidak ditemukan|sudah digunakan|sudah terdaftar|terlalu besar|tidak berhak|tidak memiliki izin)/.test(m)) return 'error';
  if (/(berhasil|sukses|tersimpan|terkirim|ditambahkan|diupdate|dihapus)/.test(m)) return 'success';
  if (/(silakan|pilih|wajib|harap|isi |lengkapi)/.test(m)) return 'warning';
  return 'info';
}

const DEFAULT_TITLES: Record<DialogType, string> = {
  success: 'Berhasil',
  error: 'Terjadi Kesalahan',
  warning: 'Perhatian',
  info: 'Informasi'
};

export function showAlert(message: string, options: AlertOptions = {}): Promise<void> {
  const text = String(message ?? '');
  const type = options.type || inferType(text);
  return new Promise<void>(resolve => {
    queue = [
      ...queue,
      {
        id: nextId++,
        kind: 'alert',
        message: text,
        type,
        title: options.title || DEFAULT_TITLES[type],
        buttonText: options.buttonText || 'Mengerti',
        resolve
      }
    ];
    emit();
  });
}

export function showConfirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  const variant = options.variant || 'default';
  return new Promise<boolean>(resolve => {
    queue = [
      ...queue,
      {
        id: nextId++,
        kind: 'confirm',
        message: String(message ?? ''),
        title: options.title || (variant === 'danger' ? 'Konfirmasi Penghapusan' : 'Konfirmasi'),
        confirmText: options.confirmText || (variant === 'danger' ? 'Ya, Hapus' : 'Ya, Lanjutkan'),
        cancelText: options.cancelText || 'Batal',
        variant,
        resolve
      }
    ];
    emit();
  });
}
