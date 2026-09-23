import { Router } from 'express';
import { SERVICE_AREAS, ServiceAreaItem } from '../../data/serviceAreasData';

export type { ServiceAreaItem };
export { SERVICE_AREAS };

const router = Router();

// GET all service areas
router.get('/', (req, res) => {
  const query = req.query.q ? String(req.query.q).toLowerCase().trim() : '';
  if (!query) {
    return res.json(SERVICE_AREAS);
  }

  // Filter based on region name or districts
  const filtered = SERVICE_AREAS.filter((area) => {
    const matchRegion = area.region.toLowerCase().includes(query);
    const matchDistrict = area.districts.some((d) => d.toLowerCase().includes(query));
    return matchRegion || matchDistrict;
  });

  return res.json(filtered);
});

// GET single area by ID
router.get('/:id', (req, res) => {
  const area = SERVICE_AREAS.find((a) => a.id === parseInt(req.params.id, 10));
  if (!area) {
    return res.status(404).json({ error: 'Area layanan tidak ditemukan' });
  }
  return res.json(area);
});

export default router;
