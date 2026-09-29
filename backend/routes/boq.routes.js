const express = require('express');
const { getProjectBoq, freezeBoq, disbursePayment, getFirstProject, updateProjectStatus } = require('../controllers/boq.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/first', protect, getFirstProject);
router.get('/:id', protect, getProjectBoq);
router.post('/:id/freeze', protect, authorize('PROJECT_MANAGER', 'ADMIN'), freezeBoq);
router.post('/payments/disburse', protect, authorize('PROJECT_MANAGER', 'ADMIN'), disbursePayment);
router.put('/:id/status', protect, authorize('PROJECT_MANAGER', 'ADMIN'), updateProjectStatus);

module.exports = router;
