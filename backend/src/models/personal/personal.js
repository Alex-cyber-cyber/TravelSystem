const mongoose = require('mongoose');

const personas = new mongoose.Schema({
    idEmpleado: { type: String, required: true, unique: true },
    nombres: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    departamento: { type: String, required: true },
    fechaContratacion: { type: Date, required: true },
    estado: { type: String, required: true },
});

module.exports = mongoose.model('Personal', personas);
