// src/routes/reportes/transportistas.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken, requireTripPermission } = require('../../middlewares/authMiddleware');
const Viaje = require('../../models/viaje/viaje');

router.get('/', verifyToken, requireTripPermission, async (req, res) => {
  try {
    const { desde, hasta, transportista_id } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Parámetros "desde" y "hasta" son requeridos (YYYY-MM-DD)' });
    }

    const start = new Date(desde); start.setHours(0,0,0,0);
    const end = new Date(hasta);   end.setHours(23,59,59,999);

    const match = { fecha: { $gte: start, $lte: end } };
    if (transportista_id) match.transportista_id = new mongoose.Types.ObjectId(transportista_id);

    const pipeline = [
      { $match: match },
      { $lookup: { from: 'transportistas', localField: 'transportista_id', foreignField: '_id', as: 'transportista' } },
      { $unwind: '$transportista' },
      { $lookup: { from: 'sucursals', localField: 'sucursal_id', foreignField: '_id', as: 'sucursal' } },
      { $unwind: { path: '$sucursal', preserveNullAndEmptyArrays: true } },
      { $addFields: {
          tarifa_por_km: { $ifNull: ['$tarifa_total', '$transportista.tarifa'] },
          monto_viaje: { $multiply: ['$total_km', { $ifNull: ['$tarifa_total', '$transportista.tarifa'] }] },
          colaboradores_count: { $size: { $ifNull: ['$colaboradores', []] } }
      }},
      { $project: {
          fecha: 1, total_km: 1, observaciones: 1, colaboradores_count: 1,
          'transportista.nombre': 1, tarifa_por_km: 1, monto_viaje: 1,
          'sucursal.name': 1
      }},
      { $sort: { fecha: 1 } },
      { $facet: {
          detalle: [ { $match: {} } ],
          resumen: [ { $group: { _id: null, total_viajes: { $sum: 1 }, total_km: { $sum: '$total_km' }, total_pagar: { $sum: '$monto_viaje' } } } ]
      }}
    ];

    const result = await Viaje.aggregate(pipeline).exec();
    const detalle = result[0]?.detalle || [];
    const resumen = result[0]?.resumen?.[0] || { total_viajes: 0, total_km: 0, total_pagar: 0 };

    res.json({ filtros: { desde, hasta, transportista_id: transportista_id || null }, detalle, resumen });
  } catch (e) {
    console.error('Reporte transportistas error:', e);
    res.status(500).json({ error: 'Error generando reporte' });
  }
});

module.exports = router;
