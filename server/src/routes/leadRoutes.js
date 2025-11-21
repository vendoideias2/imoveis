const router = require('express').Router();
const leadController = require('../controllers/leadController');

router.post('/', leadController.create);
router.get('/', leadController.getAll);
router.patch('/:id/status', leadController.updateStatus);

module.exports = router;
