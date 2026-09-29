const express = require('express');
const { auditSiteLog, getSiteLogs } = require('../controllers/audit.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/audit/:projectId', protect, getSiteLogs);
router.post('/audit-site-log', protect, authorize('SITE_ENGINEER', 'PROJECT_MANAGER', 'ADMIN'), auditSiteLog);

module.exports = router;
