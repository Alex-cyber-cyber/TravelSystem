import { Router } from 'express';
import { getViajesPorFecha, crearViaje } from '../../controllers/viaje/viajes.controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, getViajesPorFecha);
router.post('/', authMiddleware, crearViaje);

export default router;

