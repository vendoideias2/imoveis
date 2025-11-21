const router = require('express').Router();
const inspectionController = require('../controllers/inspectionController');

router.post('/', inspectionController.create);
router.get('/', inspectionController.getAll);
router.get('/:id', inspectionController.getById);
router.put('/:id', inspectionController.update);
router.delete('/:id', inspectionController.delete);

module.exports = router;
