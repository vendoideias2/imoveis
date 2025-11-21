const router = require('express').Router();
const tenantController = require('../controllers/tenantController');

router.post('/', tenantController.create);
router.get('/', tenantController.getAll);
router.get('/:id', tenantController.getById);
router.put('/:id', tenantController.update);
router.delete('/:id', tenantController.delete);

module.exports = router;
