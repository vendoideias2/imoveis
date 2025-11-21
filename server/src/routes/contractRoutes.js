const router = require('express').Router();
const contractController = require('../controllers/contractController');

router.post('/', contractController.create);
router.get('/', contractController.getAll);
router.get('/:id', contractController.getById);
router.put('/:id', contractController.update);
router.delete('/:id', contractController.delete);

module.exports = router;
