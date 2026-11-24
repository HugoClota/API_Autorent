const express = require('express');
const router = express.Router();
const { getModels, getModelById, createModel, updateModel, deleteModel } = require('../controllers/models.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', getModels);
router.get('/:id', getModelById);
router.post('/', verifyToken, isAdmin, createModel);
router.put('/:id', verifyToken, isAdmin, updateModel);
router.delete('/:id', verifyToken, isAdmin, deleteModel);

module.exports = router;