const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Configure storage for property images
const propertyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/properties');
        ensureDirectoryExists(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'property-' + uniqueSuffix + ext);
    }
});

// Configure storage for deal documents
const dealStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/deals');
        ensureDirectoryExists(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'deal-' + uniqueSuffix + ext);
    }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não suportado. Apenas JPG, PNG e WEBP são permitidos.'), false);
    }
};

// File filter for documents (PDF + images)
const documentFileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não suportado. Apenas imagens (JPG, PNG, WEBP) e PDF são permitidos.'), false);
    }
};

// Image upload middleware (max 5MB per file)
const imageUpload = multer({
    storage: propertyStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Document upload middleware (max 10MB per file)
const documentUpload = multer({
    storage: dealStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Arquivo muito grande',
                message: 'O arquivo excede o tamanho máximo permitido'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Muitos arquivos',
                message: 'Você excedeu o número máximo de arquivos permitidos'
            });
        }
        return res.status(400).json({
            error: 'Erro no upload',
            message: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            error: 'Erro no upload',
            message: err.message
        });
    }

    next();
};

module.exports = {
    imageUpload,
    documentUpload,
    handleUploadError
};
