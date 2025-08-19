const mongoose = require('mongoose');

const ViajeSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  sucursal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal', required: true },
  transportista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transportista', required: true },
  colaboradores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Personal', required: true }],
  registrado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_km: { type: Number, required: true },
  tarifa_total: { type: Number, required: true },
  observaciones: String,
  estado: { type: String, enum: ['pendiente', 'completado', 'cancelado'], default: 'pendiente' },
  fecha_registro: { type: Date, default: Date.now }
}, { collection: 'viajes' });

module.exports = mongoose.model('viaje', ViajeSchema);
