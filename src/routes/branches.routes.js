const express = require('express');
const router = express.Router();
const { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } = require('../controllers/branches.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', getBranches);
router.get('/:id', getBranchById);
router.post('/', verifyToken, isAdmin, createBranch);
router.put('/:id', verifyToken, isAdmin, updateBranch);
router.delete('/:id', verifyToken, isAdmin, deleteBranch);

module.exports = router;