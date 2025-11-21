const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const contractController = {
    // Create a new contract
    async create(req, res) {
        try {
            const { propertyId, tenantId, ownerId, startDate, endDate, value, depositValue, status, documents } = req.body;

            if (!propertyId || !tenantId || !ownerId || !startDate || !endDate || !value) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const contract = await prisma.contract.create({
                data: {
                    propertyId,
                    tenantId,
                    ownerId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    value: parseFloat(value),
                    depositValue: depositValue ? parseFloat(depositValue) : null,
                    status: status || 'ACTIVE',
                    documents: documents || []
                }
            });

            // Update property status to RENTED
            await prisma.property.update({
                where: { id: propertyId },
                data: { status: 'RENTED' }
            });

            res.status(201).json(contract);
        } catch (error) {
            console.error('Error creating contract:', error);
            res.status(500).json({ error: 'Failed to create contract' });
        }
    },

    // Get all contracts
    async getAll(req, res) {
        try {
            const contracts = await prisma.contract.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    property: { select: { title: true } },
                    tenant: { select: { name: true } },
                    owner: { select: { name: true } }
                }
            });
            res.json(contracts);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            res.status(500).json({ error: 'Failed to fetch contracts' });
        }
    },

    // Get contract by ID
    async getById(req, res) {
        try {
            const { id } = req.params;

            const contract = await prisma.contract.findUnique({
                where: { id },
                include: {
                    property: true,
                    tenant: true,
                    owner: true
                }
            });

            if (!contract) {
                return res.status(404).json({ error: 'Contract not found' });
            }

            res.json(contract);
        } catch (error) {
            console.error('Error fetching contract:', error);
            res.status(500).json({ error: 'Failed to fetch contract' });
        }
    },

    // Update contract
    async update(req, res) {
        try {
            const { id } = req.params;
            const { startDate, endDate, value, depositValue, status, documents } = req.body;

            const contract = await prisma.contract.update({
                where: { id },
                data: {
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    value: value ? parseFloat(value) : undefined,
                    depositValue: depositValue ? parseFloat(depositValue) : undefined,
                    status,
                    documents
                }
            });

            res.json(contract);
        } catch (error) {
            console.error('Error updating contract:', error);
            res.status(500).json({ error: 'Failed to update contract' });
        }
    },

    // Delete contract
    async delete(req, res) {
        try {
            const { id } = req.params;

            await prisma.contract.delete({
                where: { id }
            });

            res.json({ message: 'Contract deleted successfully' });
        } catch (error) {
            console.error('Error deleting contract:', error);
            res.status(500).json({ error: 'Failed to delete contract' });
        }
    }
};

module.exports = contractController;
