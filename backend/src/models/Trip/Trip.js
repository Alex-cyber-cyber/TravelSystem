const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  branch: { type: String, required: true },
  distance: { type: Number, min: 1, max: 50 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);