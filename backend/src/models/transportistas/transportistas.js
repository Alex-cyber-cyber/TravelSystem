const mongoose = require('mongoose');

const TransportistaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  vehiculo: { type: String, required: true },
  placa: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  tarifa: { type: Number, required: true }, // Tarifa por km
  activo: { type: Boolean, default: true },
  fecha_registro: { type: Date, default: Date.now }
}, { collection: 'transportistas' });

module.exports = mongoose.model('Transportista', TransportistaSchema);