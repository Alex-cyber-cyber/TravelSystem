// models/register.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RegisterSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    departamento: { type: String, required: true },
    role: { type: String, required: true },
    aprobarAdmin: { type: Boolean, default: false },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { collection: 'users' }); 

RegisterSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

RegisterSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', RegisterSchema);