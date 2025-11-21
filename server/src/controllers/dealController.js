const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dealController = {
    // Get all deals
    async getAll(req, res) {
        try {
            const deals = await prisma.deal.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    lead: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true
                        }
                    },
                    property: {
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            city: true,
                            price: true
                        }
                    },
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            res.json(deals);
        } catch (error) {
            console.error('Error fetching deals:', error);
            res.status(500).json({ error: 'Failed to fetch deals' });
        }
    },

    // Get deal by ID
    async getById(req, res) {
        try {
            const { id } = req.params;

            const deal = await prisma.deal.findUnique({
                where: { id },
                include: {
                    lead: true,
                    property: true,
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            if (!deal) {
                return res.status(404).json({ error: 'Deal not found' });
            }

            res.json(deal);
        } catch (error) {
            console.error('Error fetching deal:', error);
            res.status(500).json({ error: 'Failed to fetch deal' });
        }
    },

    // Create a new deal
    async create(req, res) {
        try {
            const { leadId, propertyId, agentId, value, commission, status } = req.body;

            if (!leadId || !propertyId || !agentId || !value) {
                return res.status(400).json({
                    error: 'LeadId, propertyId, agentId and value are required'
                });
            }

            // Validate that lead, property and agent exist
            const [lead, property, agent] = await Promise.all([
                prisma.lead.findUnique({ where: { id: leadId } }),
                prisma.property.findUnique({ where: { id: propertyId } }),
                prisma.user.findUnique({ where: { id: agentId } })
            ]);

            if (!lead) {
                return res.status(404).json({ error: 'Lead not found' });
            }
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            if (!agent) {
                return res.status(404).json({ error: 'Agent not found' });
            }

            const deal = await prisma.deal.create({
                data: {
                    leadId,
                    propertyId,
                    agentId,
                    value: parseFloat(value),
                    commission: commission ? parseFloat(commission) : null,
                    status: status || 'Draft'
                },
                include: {
                    lead: true,
                    property: true,
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            res.status(201).json(deal);
        } catch (error) {
            console.error('Error creating deal:', error);
            res.status(500).json({ error: 'Failed to create deal' });
        }
    },

    // Update deal
    async update(req, res) {
        try {
            const { id } = req.params;
            const { leadId, propertyId, agentId, value, commission, status } = req.body;

            const deal = await prisma.deal.update({
                where: { id },
                data: {
                    ...(leadId && { leadId }),
                    ...(propertyId && { propertyId }),
                    ...(agentId && { agentId }),
                    ...(value && { value: parseFloat(value) }),
                    ...(commission !== undefined && { commission: commission ? parseFloat(commission) : null }),
                    ...(status && { status })
                },
                include: {
                    lead: true,
                    property: true,
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            res.json(deal);
        } catch (error) {
            console.error('Error updating deal:', error);
            res.status(500).json({ error: 'Failed to update deal' });
        }
    },

    // Update deal status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }

            const validStatuses = ['Draft', 'Sent', 'Signed', 'Rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            const deal = await prisma.deal.update({
                where: { id },
                data: { status },
                include: {
                    lead: true,
                    property: true,
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            res.json(deal);
        } catch (error) {
            console.error('Error updating deal status:', error);
            res.status(500).json({ error: 'Failed to update deal status' });
        }
    },

    // Delete deal
    async delete(req, res) {
        try {
            const { id } = req.params;

            await prisma.deal.delete({
                where: { id }
            });

            res.json({ message: 'Deal deleted successfully' });
        } catch (error) {
            console.error('Error deleting deal:', error);
            res.status(500).json({ error: 'Failed to delete deal' });
        }
    },

    // Get deals statistics
    async getStats(req, res) {
        try {
            const [total, byStatus, totalValue] = await Promise.all([
                prisma.deal.count(),
                prisma.deal.groupBy({
                    by: ['status'],
                    _count: true
                }),
                prisma.deal.aggregate({
                    _sum: {
                        value: true,
                        commission: true
                    },
                    where: {
                        status: 'Signed'
                    }
                })
            ]);

            const stats = {
                total,
                byStatus: byStatus.reduce((acc, item) => {
                    acc[item.status] = item._count;
                    return acc;
                }, {}),
                totalSignedValue: totalValue._sum.value || 0,
                totalCommission: totalValue._sum.commission || 0
            };

            res.json(stats);
        } catch (error) {
            console.error('Error fetching deal stats:', error);
            res.status(500).json({ error: 'Failed to fetch deal statistics' });
        }
    }
};

module.exports = dealController;
