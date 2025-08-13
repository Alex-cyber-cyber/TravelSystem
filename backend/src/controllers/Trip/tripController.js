const Trip = require('../../models/Trip/Trip');

exports.createTrip = async (req, res) => {
  try {
    const newTrip = await Trip.create(req.body);
    res.status(201).json(newTrip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTrips = async (req, res) => {
  const trips = await Trip.find();
  res.json(trips);
};