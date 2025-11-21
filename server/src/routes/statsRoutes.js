const router = require('express').Router();
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/auth');

// Get general system statistics
router.get('/', authMiddleware, statsController.getGeneralStats);

module.exports = router;
