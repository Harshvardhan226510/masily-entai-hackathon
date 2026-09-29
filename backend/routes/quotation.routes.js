const express = require('express');
const { compareQuotations, getQuotations } = require('../controllers/quotation.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/:projectId', protect, getQuotations);
router.post('/compare-quotations', protect, authorize('PROJECT_MANAGER', 'ADMIN'), compareQuotations);

module.exports = router;
