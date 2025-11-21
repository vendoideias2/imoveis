const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tenantController = {
    // Create a new tenant
    async create(req, res) {
        try {
            const { name, email, phone, docNumber, type, maritalStatus, profession, address, documents } = req.body;

            if (!name || !phone || !docNumber || !type) {
                return res.status(400).json({ error: 'Name, phone, docNumber and type are required' });
            }

            const tenant = await prisma.tenant.create({
                data: {
                    name,
                    email,
                    phone,
                    docNumber,
                    type,
                    maritalStatus,
                    profession,
                    address,
                    documents: documents || []
                }
            });

            res.status(201).json(tenant);
        } catch (error) {
            console.error('Error creating tenant:', error);
            res.status(500).json({ error: 'Failed to create tenant' });
        }
    },

    // Get all tenants
    async getAll(req, res) {
        try {
            const tenants = await prisma.tenant.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    contracts: {
                        select: {
                            id: true,
                            status: true,
                            property: {
                                select: {
                                    title: true
                                }
                            }
                        }
                    }
                }
            });
            res.json(tenants);
        } catch (error) {
            console.error('Error fetching tenants:', error);
            res.status(500).json({ error: 'Failed to fetch tenants' });
        }
    },

    // Get tenant by ID
    async getById(req, res) {
        try {
            const { id } = req.params;

            const tenant = await prisma.tenant.findUnique({
                where: { id },
                include: {
                    contracts: {
                        include: {
                            property: true
                        }
                    }
                }
            });

            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            res.json(tenant);
        } catch (error) {
            console.error('Error fetching tenant:', error);
            res.status(500).json({ error: 'Failed to fetch tenant' });
        }
    },

    // Update tenant
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, email, phone, docNumber, type, maritalStatus, profession, address, documents } = req.body;

            const tenant = await prisma.tenant.update({
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
                    documents
                }
            });

            res.json(tenant);
        } catch (error) {
            console.error('Error updating tenant:', error);
            res.status(500).json({ error: 'Failed to update tenant' });
        }
    },

    // Delete tenant
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Check if tenant has contracts
            const tenant = await prisma.tenant.findUnique({
                where: { id },
                include: {
                    contracts: true
                }
            });

            if (tenant && tenant.contracts.length > 0) {
                return res.status(400).json({
                    error: 'Cannot delete tenant with associated contracts'
                });
            }

            await prisma.tenant.delete({
                where: { id }
            });

            res.json({ message: 'Tenant deleted successfully' });
        } catch (error) {
            console.error('Error deleting tenant:', error);
            res.status(500).json({ error: 'Failed to delete tenant' });
        }
    }
};

module.exports = tenantController;
