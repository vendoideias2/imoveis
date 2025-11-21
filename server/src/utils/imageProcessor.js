const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Compress image using Sharp
 * @param {string} filePath - Path to the original image
 * @param {object} options - Compression options
 * @returns {Promise<object>} - Metadata about compressed image
 */
async function compressImage(filePath, options = {}) {
    try {
        const {
            quality = 80,
            format = 'webp',
            maxWidth = 1920,
            maxHeight = 1080
        } = options;

        const outputPath = filePath.replace(path.extname(filePath), `.${format}`);

        await sharp(filePath)
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
        [format]({ quality })
            .toFile(outputPath);

        // Get metadata
        const metadata = await sharp(outputPath).metadata();

        // Delete original if different from output
        if (filePath !== outputPath) {
            await fs.unlink(filePath);
        }

        return {
            path: outputPath,
            width: metadata.width,
            height: metadata.height,
            size: metadata.size,
            format: metadata.format
        };
    } catch (error) {
        console.error('Error compressing image:', error);
        throw new Error('Failed to compress image');
    }
}

/**
 * Generate thumbnail for an image
 * @param {string} filePath - Path to the original image
 * @param {number} size - Thumbnail size (default 200px)
 * @returns {Promise<string>} - Path to thumbnail
 */
async function generateThumbnail(filePath, size = 200) {
    try {
        const ext = path.extname(filePath);
        const thumbnailPath = filePath.replace(ext, `_thumb${ext}`);

        await sharp(filePath)
            .resize(size, size, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 70 })
            .toFile(thumbnailPath);

        return thumbnailPath;
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        throw new Error('Failed to generate thumbnail');
    }
}

/**
 * Get image metadata
 * @param {string} filePath - Path to the image
 * @returns {Promise<object>} - Image metadata
 */
async function getImageMetadata(filePath) {
    try {
        const metadata = await sharp(filePath).metadata();
        const stats = await fs.stat(filePath);

        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: stats.size,
            aspectRatio: (metadata.width / metadata.height).toFixed(2)
        };
    } catch (error) {
        console.error('Error getting image metadata:', error);
        throw new Error('Failed to get image metadata');
    }
}

/**
 * Process uploaded image (compress + thumbnail)
 * @param {string} filePath - Path to uploaded image
 * @returns {Promise<object>} - Processing results
 */
async function processUploadedImage(filePath) {
    try {
        // Compress the image
        const compressed = await compressImage(filePath, {
            quality: 85,
            format: 'webp',
            maxWidth: 1920,
            maxHeight: 1080
        });

        // Generate thumbnail
        const thumbnailPath = await generateThumbnail(compressed.path);

        return {
            original: compressed,
            thumbnail: {
                path: thumbnailPath
            }
        };
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

module.exports = {
    compressImage,
    generateThumbnail,
    getImageMetadata,
    processUploadedImage
};
