
// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('../config'); // Importa la configuración
const registerRoutes = require('./routes/register/register');
const authRoutes = require('./routes/auth/authRoutes');

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


app.use('/api/register', registerRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;