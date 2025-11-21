const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const inspectionController = {
    // Create a new inspection
    async create(req, res) {
        try {
            const { propertyId, date, status, items, documents } = req.body;

            if (!propertyId || !date) {
                return res.status(400).json({ error: 'Property and date are required' });
            }

            const inspection = await prisma.inspection.create({
                data: {
                    propertyId,
                    date: new Date(date),
                    status: status || 'Scheduled',
                    items: items || {},
                    documents: documents || []
                }
            });

            res.status(201).json(inspection);
        } catch (error) {
            console.error('Error creating inspection:', error);
            res.status(500).json({ error: 'Failed to create inspection' });
        }
    },

    // Get all inspections (optionally filtered by property)
    async getAll(req, res) {
        try {
            const { propertyId } = req.query;
            const where = propertyId ? { propertyId } : {};

            const inspections = await prisma.inspection.findMany({
                where,
                orderBy: { date: 'desc' },
                include: {
                    property: { select: { title: true } }
                }
            });
            res.json(inspections);
        } catch (error) {
            console.error('Error fetching inspections:', error);
            res.status(500).json({ error: 'Failed to fetch inspections' });
        }
    },

    // Get inspection by ID
    async getById(req, res) {
        try {
            const { id } = req.params;

            const inspection = await prisma.inspection.findUnique({
                where: { id },
                include: {
                    property: true
                }
            });

            if (!inspection) {
                return res.status(404).json({ error: 'Inspection not found' });
            }

            res.json(inspection);
        } catch (error) {
            console.error('Error fetching inspection:', error);
            res.status(500).json({ error: 'Failed to fetch inspection' });
        }
    },

    // Update inspection
    async update(req, res) {
        try {
            const { id } = req.params;
            const { date, status, items, documents } = req.body;

            const inspection = await prisma.inspection.update({
                where: { id },
                data: {
                    date: date ? new Date(date) : undefined,
                    status,
                    items,
                    documents
                }
            });

            res.json(inspection);
        } catch (error) {
            console.error('Error updating inspection:', error);
            res.status(500).json({ error: 'Failed to update inspection' });
        }
    },

    // Delete inspection
    async delete(req, res) {
        try {
            const { id } = req.params;

            await prisma.inspection.delete({
                where: { id }
            });

            res.json({ message: 'Inspection deleted successfully' });
        } catch (error) {
            console.error('Error deleting inspection:', error);
            res.status(500).json({ error: 'Failed to delete inspection' });
        }
    }
};

module.exports = inspectionController;
