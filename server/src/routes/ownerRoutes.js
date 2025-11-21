const router = require('express').Router();
const ownerController = require('../controllers/ownerController');

router.post('/', ownerController.create);
router.get('/', ownerController.getAll);
router.get('/:id', ownerController.getById);
router.put('/:id', ownerController.update);
router.delete('/:id', ownerController.delete);

module.exports = router;
