const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ownerController = {
    // Create a new owner
    async create(req, res) {
        try {
            const { name, email, phone, docNumber, type, maritalStatus, profession, address, documents, spouseName, spouseDoc, spouseEmail, spousePhone, spouseProfession } = req.body;

            if (!name || !phone || !docNumber || !type) {
                return res.status(400).json({ error: 'Name, phone, docNumber and type are required' });
            }

            const owner = await prisma.owner.create({
                data: {
                    name,
                    email,
                    phone,
                    docNumber,
                    type,
                    maritalStatus,
                    profession,
                    address,
                    spouseName,
                    spouseDoc,
                    spouseEmail,
                    spousePhone,
                    spouseProfession,
                    documents: documents || []
                }
            });

            res.status(201).json(owner);
        } catch (error) {
            console.error('Error creating owner:', error);
            res.status(500).json({ error: 'Failed to create owner' });
        }
    },

    // Get all owners
    async getAll(req, res) {
        try {
            const owners = await prisma.owner.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    properties: {
                        select: {
                            id: true,
                            title: true,
                            status: true
                        }
                    }
                }
            });
            res.json(owners);
        } catch (error) {
            console.error('Error fetching owners:', error);
            res.status(500).json({ error: 'Failed to fetch owners' });
        }
    },

    // Get owner by ID
    async getById(req, res) {
        try {
            const { id } = req.params;

            const owner = await prisma.owner.findUnique({
                where: { id },
                include: {
                    properties: true,
                    contracts: true
                }
            });

            if (!owner) {
                return res.status(404).json({ error: 'Owner not found' });
            }

            res.json(owner);
        } catch (error) {
            console.error('Error fetching owner:', error);
            res.status(500).json({ error: 'Failed to fetch owner' });
        }
    },

    // Update owner
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, email, phone, docNumber, type, maritalStatus, profession, address, documents, spouseName, spouseDoc, spouseEmail, spousePhone, spouseProfession } = req.body;

            const owner = await prisma.owner.update({
                where: { id },
                data: {
                    name,
                    email,
                    phone,
                    docNumber,
                    type,
                    maritalStatus,
                    profession,
                    address,
                    spouseName,
                    spouseDoc,
                    spouseEmail,
                    spousePhone,
                    spouseProfession,
                    documents
                }
            });

            res.json(owner);
        } catch (error) {
            console.error('Error updating owner:', error);
            res.status(500).json({ error: 'Failed to update owner' });
        }
    },

    // Delete owner
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Check if owner has properties
            const owner = await prisma.owner.findUnique({
                where: { id },
                include: {
                    properties: true
                }
            });

            if (owner && owner.properties.length > 0) {
                return res.status(400).json({
                    error: 'Cannot delete owner with associated properties'
                });
            }

            await prisma.owner.delete({
                where: { id }
            });

            res.json({ message: 'Owner deleted successfully' });
        } catch (error) {
            console.error('Error deleting owner:', error);
            res.status(500).json({ error: 'Failed to delete owner' });
        }
    }
};

module.exports = ownerController;
