const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Viaje = require('../../models/viaje/viaje'); 
const { verifyToken, requireTripPermission } = require('../../middlewares/authMiddleware');
const { getViajesPorFecha, crearViaje } = require('../../controllers/viaje/viaje');


router.post('/', verifyToken, requireTripPermission, crearViaje);

router.get('/historial', verifyToken, async (req, res) => {
  try {
    const { desde, hasta, sucursal_id, transportista_id } = req.query;

    const start = new Date(desde || new Date().toISOString().substring(0, 10));
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(hasta || new Date().toISOString().substring(0, 10));
    end.setUTCHours(23, 59, 59, 999);

    const q = { fecha: { $gte: start, $lte: end } };
    if (sucursal_id && mongoose.isValidObjectId(sucursal_id)) q.sucursal_id = sucursal_id;
    if (transportista_id && mongoose.isValidObjectId(transportista_id)) q.transportista_id = transportista_id;

    const viajes = await Viaje.find(q)
      .populate({ path: 'sucursal_id', select: 'name' })
      .populate({ path: 'transportista_id', select: 'nombre tarifa' })
      .populate({ path: 'colaboradores', select: 'nombres' })
      .populate({ path: 'registrado_por', select: 'nombres' })
      .lean();

    const data = viajes.map(v => ({
      _id: v._id,
      fecha: v.fecha,
      fecha_registro: v.fecha_registro,
      sucursal: v.sucursal_id,
      sucursal_id: v.sucursal_id?._id || v.sucursal_id,
      transportista: v.transportista_id,
      transportista_id: v.transportista_id?._id || v.transportista_id,
      colaboradores: v.colaboradores || [],
      registrado_por: v.registrado_por,
      total_km: Number(v.total_km || 0),
      tarifa_por_km: v.transportista_id?.tarifa !== undefined ? Number(v.transportista_id.tarifa) : undefined,
      tarifa_total: v.tarifa_total !== undefined ? Number(v.tarifa_total) : undefined,
      observaciones: v.observaciones || ''
    }));

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error en historial' });
  }
});

router.get('/', verifyToken, getViajesPorFecha);
module.exports = router;
