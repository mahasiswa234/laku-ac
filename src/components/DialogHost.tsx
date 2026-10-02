import { useEffect, useRef, useSyncExternalStore } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, Trash2, HelpCircle, X } from 'lucide-react';
import { closeDialog, getDialogQueue, subscribeDialogs, DialogType } from '../utils/dialog';

const TYPE_STYLE: Record<DialogType, { ring: string; icon: string; bar: string; button: string; Icon: typeof Info }> = {
  success: {
    ring: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    bar: 'from-emerald-400 to-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-400',
    Icon: CheckCircle2
  },
  error: {
    ring: 'bg-rose-100 dark:bg-rose-900/30',
    icon: 'text-rose-600 dark:text-rose-400',
    bar: 'from-rose-400 to-rose-600',
    button: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-400',
    Icon: XCircle
  },
  warning: {
    ring: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-400',
    bar: 'from-amber-400 to-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-400',
    Icon: AlertTriangle
  },
  info: {
    ring: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    bar: 'from-blue-400 to-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-400',
    Icon: Info
  }
};

/**
 * Menampilkan dialog kustom dari antrean layanan dialog.
 * Dipasang SEKALI di App.tsx. Dialog ditampilkan satu per satu sesuai urutan.
 */
export default function DialogHost() {
  const queue = useSyncExternalStore(subscribeDialogs, getDialogQueue, getDialogQueue);
  const current = queue[0];
  const primaryRef = useRef<HTMLButtonElement>(null);

  // Fokus ke tombol utama + tutup dengan Escape + cegah scroll latar
  useEffect(() => {
    if (!current) return;
    primaryRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog(current.id, false);
      }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [current?.id]);

  if (!current) return null;

  const isConfirm = current.kind === 'confirm';
  const danger = current.kind === 'confirm' && current.variant === 'danger';
  const style = isConfirm ? (danger ? TYPE_STYLE.error : TYPE_STYLE.info) : TYPE_STYLE[current.type];
  const IconEl = isConfirm ? (danger ? Trash2 : HelpCircle) : style.Icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm dialog-fade"
      onMouseDown={e => {
        // klik di luar kartu = batal (untuk alert = tutup)
        if (e.target === e.currentTarget) closeDialog(current.id, false);
      }}
    >
      <div
        role={isConfirm ? 'alertdialog' : 'alertdialog'}
        aria-modal="true"
        aria-labelledby={`dialog-title-${current.id}`}
        aria-describedby={`dialog-msg-${current.id}`}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200/70 dark:ring-slate-700/70 dialog-pop"
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${style.bar}`} />

        <button
          type="button"
          onClick={() => closeDialog(current.id, false)}
          aria-label="Tutup"
          className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="px-6 pb-6 pt-6 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${style.ring} dialog-icon`}>
            <IconEl size={34} className={style.icon} strokeWidth={2.2} />
          </div>

          <h3 id={`dialog-title-${current.id}`} className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {current.title}
          </h3>
          <p
            id={`dialog-msg-${current.id}`}
            className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600 dark:text-slate-400"
          >
            {current.message}
          </p>

          {current.kind === 'confirm' ? (
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => closeDialog(current.id, false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                {current.cancelText}
              </button>
              <button
                ref={primaryRef}
                type="button"
                onClick={() => closeDialog(current.id, true)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  danger ? TYPE_STYLE.error.button : TYPE_STYLE.info.button
                }`}
              >
                {current.confirmText}
              </button>
            </div>
          ) : (
            <button
              ref={primaryRef}
              type="button"
              onClick={() => closeDialog(current.id)}
              className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${style.button}`}
            >
              {current.buttonText}
            </button>
          )}

          {queue.length > 1 && (
            <p className="mt-3 text-[11px] text-slate-400">{queue.length - 1} pemberitahuan lainnya menunggu</p>
          )}
        </div>
      </div>
    </div>
  );
}
