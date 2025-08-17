const mongoose = require('mongoose');
const asignarSucursalChema = new mongoose.Schema({
    personal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Personal',
        required: true
    },
    sucursal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true
    },
    fechaAsignacion: {
        type: Date,
        default: Date.now
    },
    distancia_km: {
        type: Number,
        required: true,
        min:0.01,
        max:50
    }
});

asignarSucursalChema.index({ personal_id: 1, sucursal_id: 1 }, 
    { 
        unique: true,
        message: 'Este colaborador ya esta asignado a esta sucursal'
});

module.exports = mongoose.model('AsignarSucursales', asignarSucursalChema);
