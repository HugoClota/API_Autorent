const express = require('express');
const router = express.Router();
const { getCars, getCarById, createCar, updateCar, deleteCar } = require('../controllers/cars.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', getCars);
router.get('/:id', getCarById);
router.post('/', verifyToken, isAdmin, createCar);
router.put('/:id', verifyToken, isAdmin, updateCar);
router.delete('/:id', verifyToken, isAdmin, deleteCar);

module.exports = router;