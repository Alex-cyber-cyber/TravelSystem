// config.js
require('dotenv').config(); // Para variables de entorno

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://enestoralexander:QwPjp7IT2XaB2Roh@cluster0.yey93cu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || 'K7#pL92$qR!4tW6zY8vX2sB5mN1cV3gH9jU0_TR1V3LS7ST3M!@#',
  PORT: process.env.PORT || 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4200'
};