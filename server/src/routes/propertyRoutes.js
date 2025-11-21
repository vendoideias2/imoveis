const router = require('express').Router();
const propertyController = require('../controllers/propertyController');
const { imageUpload, handleUploadError } = require('../middleware/uploadMiddleware');

router.post('/', propertyController.create);
router.get('/', propertyController.getAll);
router.get('/:id', propertyController.getById);

// Image management routes
router.post('/:id/images', imageUpload.array('images', 10), handleUploadError, propertyController.uploadImages);
router.delete('/:id/images/:imageIndex', propertyController.deleteImage);
router.put('/:id/images/reorder', propertyController.reorderImages);
router.put('/:id/images/main/:imageIndex', propertyController.setMainImage);

module.exports = router;
