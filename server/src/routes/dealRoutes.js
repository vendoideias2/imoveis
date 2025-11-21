const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', dealController.getAll);
router.get('/stats', dealController.getStats);
router.get('/:id', dealController.getById);
router.post('/', dealController.create);
router.put('/:id', dealController.update);
router.put('/:id/status', dealController.updateStatus);
router.delete('/:id', dealController.delete);

module.exports = router;
