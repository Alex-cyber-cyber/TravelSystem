const express = require('express');
const router = express.Router();
const { createTrip, getTrips } = require('../../controllers/Trip/tripController');

router.post('/', createTrip);
router.get('/', getTrips);

module.exports = router;