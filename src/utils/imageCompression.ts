import imageCompression from 'browser-image-compression';

/**
 * Mengompres file gambar (foto bukti transfer, foto progress servis, dll) lalu
 * mengembalikannya sebagai data URI base64 (string "data:image/jpeg;base64,...")
 * agar bisa langsung disimpan sebagai TEXT/LONGTEXT di database dan ditampilkan
 * langsung lewat tag <img src="..."> tanpa perlu endpoint upload file terpisah.
 *
 * Memakai library `browser-image-compression` (bukan resize manual via canvas)
 * supaya kompresi lebih konsisten, berjalan di Web Worker (tidak memblokir UI),
 * dan ukuran file akhir lebih terprediksi.
 */
export async function compressImageToDataUrl(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.6,            // target maksimal ~600KB setelah kompresi
    maxWidthOrHeight: 1280,    // cukup jelas utk foto AC/bukti transfer, tidak kebesaran
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
    initialQuality: 0.8
  };

  const compressedBlob = await imageCompression(file, options);
  return await blobToDataUrl(compressedBlob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(blob);
  });
}
