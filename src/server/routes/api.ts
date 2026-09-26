import { Router } from 'express';

import authRoutes from './auth.js';
import serviceRoutes from './services.js';
import serviceAreaRoutes from './service_areas.js';
import requestRoutes from './requests.js';
import customerRoutes from './customers.js';
import technicianRoutes from './technicians.js';
import acUnitRoutes from './ac_units.js';
import scheduleRoutes from './schedules.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sistem Manajemen Servis AC API is running',
    phase: 6
  });
});

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/service-areas', serviceAreaRoutes);
router.use('/requests', requestRoutes);
router.use('/customers', customerRoutes);
router.use('/technicians', technicianRoutes);
router.use('/ac-units', acUnitRoutes);
router.use('/schedules', scheduleRoutes);

export default router;