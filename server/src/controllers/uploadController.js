const path = require('path');

const uploadController = {
    // Upload single file
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const fileUrl = `/uploads/documents/${req.file.filename}`;

            res.json({
                message: 'File uploaded successfully',
                url: fileUrl,
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    },

    // Upload multiple files
    async uploadFiles(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            const uploadedFiles = req.files.map(file => ({
                url: `/uploads/documents/${file.filename}`,
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }));

            res.json({
                message: 'Files uploaded successfully',
                files: uploadedFiles
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            res.status(500).json({ error: 'Failed to upload files' });
        }
    }
};

module.exports = uploadController;
