const express = require('express');
const router = express.Router();
const {
  getReservations, getReservationById, createReservation, updateReservation, deleteReservation
} = require('../controllers/reservations.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, getReservations);
router.get('/:id', verifyToken, getReservationById);
router.post('/', verifyToken, createReservation);
router.put('/:id', verifyToken, updateReservation);
router.delete('/:id', verifyToken, deleteReservation);

module.exports = router;