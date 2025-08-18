
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('../config'); 
const registerRoutes = require('./routes/register/register');
const authRoutes = require('./routes/auth/authRoutes');
const sucursalRoutes = require('./routes/sucursal/sucursal');
const EmployeeRoutes = require('./routes/personal/persoonal'); 
const AsignarSucursales = require('./routes/AsignarSucursales/AsignarSucursales');
const transportista = require('./routes/transportistas/transportistas');
const viajes = require('./routes/viajes/viajes');

const app = express();

app.use(cors({
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

mongoose.connection.once('open', () => {
    console.log('Modelos registrados:', mongoose.modelNames());
});


app.use('/api/auth/register', registerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/employees', EmployeeRoutes);
app.use('/api/AsignarSucursales', require('./routes/AsignarSucursales/AsignarSucursales'));
app.use('/api/transportistas', transportista);
app.use('/api/viajes', viajes);


app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.path}`);
  next();
});

module.exports = app;