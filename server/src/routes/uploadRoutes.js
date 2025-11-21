const router = require('express').Router();
const uploadController = require('../controllers/uploadController');
const { genericUpload, handleUploadError } = require('../middleware/uploadMiddleware');

router.post('/', genericUpload.single('file'), handleUploadError, uploadController.uploadFile);
router.post('/multiple', genericUpload.array('files', 10), handleUploadError, uploadController.uploadFiles);

module.exports = router;
