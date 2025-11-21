const { PrismaClient } = require('@prisma/client');
const path = require('path');
const prisma = new PrismaClient();

const propertyController = {
    // Create a new property
    async create(req, res) {
        try {
            const {
                title, description, type, price,
                condoPrice, iptuPrice, areaTotal, areaUseful,
                bedrooms, bathrooms, parkingSpaces,
                address, city, state, zipCode,
                ownerId
            } = req.body;

            // Basic validation
            if (!title || !price || !type || !ownerId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const property = await prisma.property.create({
                data: {
                    title, description, type,
                    price: parseFloat(price),
                    condoPrice: condoPrice ? parseFloat(condoPrice) : null,
                    iptuPrice: iptuPrice ? parseFloat(iptuPrice) : null,
                    areaTotal: areaTotal ? parseFloat(areaTotal) : null,
                    areaUseful: areaUseful ? parseFloat(areaUseful) : null,
                    bedrooms: bedrooms ? parseInt(bedrooms) : null,
                    bathrooms: bathrooms ? parseInt(bathrooms) : null,
                    parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : null,
                    address, city, state, zipCode,
                    ownerId
                }
            });

            res.status(201).json(property);
        } catch (error) {
            console.error('Error creating property:', error);
            res.status(500).json({ error: 'Failed to create property' });
        }
    },

    // Get all properties with filters
    async getAll(req, res) {
        try {
            const { type, city, minPrice, maxPrice } = req.query;

            const where = {};
            if (type) where.type = type;
            if (city) where.city = { contains: city, mode: 'insensitive' };
            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price.gte = parseFloat(minPrice);
                if (maxPrice) where.price.lte = parseFloat(maxPrice);
            }

            const properties = await prisma.property.findMany({
                where,
                include: {
                    owner: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(properties);
        } catch (error) {
            console.error('Error fetching properties:', error);
            res.status(500).json({ error: 'Failed to fetch properties' });
        }
    },

    // Get single property by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const property = await prisma.property.findUnique({
                where: { id },
                include: {
                    owner: true
                }
            });

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            res.json(property);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch property' });
        }
    },

    // Upload images for a property with compression
    async uploadImages(req, res) {
        try {
            const { id } = req.params;

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No images uploaded' });
            }

            // Get current property
            const property = await prisma.property.findUnique({
                where: { id }
            });

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            // Process and compress images
            const { processUploadedImage } = require('../utils/imageProcessor');
            const processedImages = [];

            for (const file of req.files) {
                try {
                    const result = await processUploadedImage(file.path);
                    const imageUrl = `/uploads/properties/${path.basename(result.original.path)}`;
                    const thumbnailUrl = `/uploads/properties/${path.basename(result.thumbnail.path)}`;

                    processedImages.push({
                        url: imageUrl,
                        thumbnail: thumbnailUrl,
                        width: result.original.width,
                        height: result.original.height,
                        size: result.original.size
                    });
                } catch (error) {
                    console.error(`Error processing image ${file.filename}:`, error);
                    // Continue with other images even if one fails
                }
            }

            // Extract just URLs for database (keeping backward compatibility)
            const imageUrls = processedImages.map(img => img.url);

            // Merge with existing images
            const currentImages = property.images || [];
            const updatedImages = [...currentImages, ...imageUrls];

            // Update property with new images
            const updatedProperty = await prisma.property.update({
                where: { id },
                data: {
                    images: updatedImages
                }
            });

            res.json({
                message: 'Images uploaded and compressed successfully',
                images: updatedImages,
                processedImages: processedImages,
                property: updatedProperty
            });
        } catch (error) {
            console.error('Error uploading images:', error);
            res.status(500).json({ error: 'Failed to upload images' });
        }
    },

    // Delete a specific image
    async deleteImage(req, res) {
        try {
            const { id, imageIndex } = req.params;
            const index = parseInt(imageIndex);

            const property = await prisma.property.findUnique({
                where: { id }
            });

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            if (!property.images || index >= property.images.length || index < 0) {
                return res.status(400).json({ error: 'Invalid image index' });
            }

            // Remove image from array
            const updatedImages = property.images.filter((_, i) => i !== index);

            // Delete physical files
            const fs = require('fs').promises;
            const imageToDelete = property.images[index];
            const imagePath = path.join(__dirname, '../../', imageToDelete);

            try {
                await fs.unlink(imagePath);
                // Try to delete thumbnail too
                const thumbnailPath = imagePath.replace(path.extname(imagePath), '_thumb' + path.extname(imagePath));
                await fs.unlink(thumbnailPath).catch(() => { }); // Ignore if thumbnail doesn't exist
            } catch (error) {
                console.error('Error deleting file:', error);
                // Continue even if file deletion fails
            }

            // Update property
            const updatedProperty = await prisma.property.update({
                where: { id },
                data: { images: updatedImages }
            });

            res.json({
                message: 'Image deleted successfully',
                images: updatedImages,
                property: updatedProperty
            });
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({ error: 'Failed to delete image' });
        }
    },

    // Reorder images
    async reorderImages(req, res) {
        try {
            const { id } = req.params;
            const { newOrder } = req.body; // Array of indices

            if (!Array.isArray(newOrder)) {
                return res.status(400).json({ error: 'newOrder must be an array' });
            }

            const property = await prisma.property.findUnique({
                where: { id }
            });

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            const currentImages = property.images || [];

            // Validate newOrder
            if (newOrder.length !== currentImages.length) {
                return res.status(400).json({ error: 'Invalid order array length' });
            }

            // Reorder images based on newOrder indices
            const reorderedImages = newOrder.map(index => currentImages[index]);

            // Update property
            const updatedProperty = await prisma.property.update({
                where: { id },
                data: { images: reorderedImages }
            });

            res.json({
                message: 'Images reordered successfully',
                images: reorderedImages,
                property: updatedProperty
            });
        } catch (error) {
            console.error('Error reordering images:', error);
            res.status(500).json({ error: 'Failed to reorder images' });
        }
    },

    // Set main image (move to first position)
    async setMainImage(req, res) {
        try {
            const { id, imageIndex } = req.params;
            const index = parseInt(imageIndex);

            const property = await prisma.property.findUnique({
                where: { id }
            });

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            if (!property.images || index >= property.images.length || index < 0) {
                return res.status(400).json({ error: 'Invalid image index' });
            }

            // Move selected image to first position
            const images = [...property.images];
            const [mainImage] = images.splice(index, 1);
            const reorderedImages = [mainImage, ...images];

            // Update property
            const updatedProperty = await prisma.property.update({
                where: { id },
                data: { images: reorderedImages }
            });

            res.json({
                message: 'Main image set successfully',
                images: reorderedImages,
                property: updatedProperty
            });
        } catch (error) {
            console.error('Error setting main image:', error);
            res.status(500).json({ error: 'Failed to set main image' });
        }
    }
};

module.exports = propertyController;
