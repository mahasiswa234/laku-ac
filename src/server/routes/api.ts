import { Router } from 'express';

import authRoutes from './auth';
import serviceRoutes from './services';
import serviceAreaRoutes from './service_areas';
import requestRoutes from './requests';
import customerRoutes from './customers';
import technicianRoutes from './technicians';
import acUnitRoutes from './ac_units';
import scheduleRoutes from './schedules';

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