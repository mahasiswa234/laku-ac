/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import ServiceArea from './pages/ServiceArea';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Invoice from './pages/Invoice';

// Dashboard Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminTechnicians from './pages/AdminTechnicians';
import AdminCustomers from './pages/AdminCustomers';
import AdminServices from './pages/AdminServices';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianHistory from './pages/TechnicianHistory';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerUnit from './pages/CustomerUnit';

// Placeholder for unbuilt pages
function BlankWireframe({ title }: { title: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-slate-500">Wireframe / Layout untuk {title} (Tahap 5).</p>
    </div>
  );
}

// --- App Router ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="tentang" element={<About />} />
          <Route path="layanan" element={<Services />} />
          <Route path="area-layanan" element={<ServiceArea />} />
          <Route path="area" element={<ServiceArea />} />
          <Route path="galeri" element={<Gallery />} />
          <Route path="harga" element={<Pricing />} />
          <Route path="kontak" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="daftar" element={<Register />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pesanan" element={<AdminOrders />} />
          <Route path="teknisi" element={<AdminTechnicians />} />
          <Route path="pelanggan" element={<AdminCustomers />} />
          <Route path="layanan" element={<AdminServices />} />
        </Route>

        {/* Technician Dashboard Routes */}
        <Route path="/teknisi" element={<DashboardLayout role="technician" />}>
          <Route path="jadwal" element={<TechnicianDashboard />} />
          <Route path="riwayat" element={<TechnicianHistory />} />
        </Route>

        {/* Customer Dashboard Routes */}
        <Route path="/pelanggan" element={<DashboardLayout role="customer" />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="pesan" element={<Booking />} />
          <Route path="unit" element={<CustomerUnit />} />
        </Route>
        
        {/* Standalone Invoice Route */}
        <Route path="/invoice/:id" element={<Invoice />} />
      </Routes>
    </BrowserRouter>
  );
}

