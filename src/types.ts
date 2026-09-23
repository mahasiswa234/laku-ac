export interface User {
  id: string;
  name: string;
  role: 'admin' | 'technician' | 'customer';
  email: string;
}

export interface ServiceRequest {
  id: string;
  serviceType: string;
  date: string;
  status: 'Menunggu' | 'Dijadwalkan' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  complaint: string;
}
