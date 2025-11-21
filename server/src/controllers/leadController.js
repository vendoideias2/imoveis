const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const leadController = {
    // Create a new lead
    async create(req, res) {
        try {
            const { name, email, phone, source, notes, status } = req.body;

            if (!name || !phone) {
                return res.status(400).json({ error: 'Name and phone are required' });
            }

            const lead = await prisma.lead.create({
                data: {
                    name,
                    email,
                    phone,
                    source,
                    notes,
                    status: status || 'NEW'
                }
            });

            res.status(201).json(lead);
        } catch (error) {
            console.error('Error creating lead:', error);
            res.status(500).json({ error: 'Failed to create lead' });
        }
    },

    // Get all leads
    async getAll(req, res) {
        try {
            const leads = await prisma.lead.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    agent: {
                        select: { name: true }
                    }
                }
            });
            res.json(leads);
        } catch (error) {
            console.error('Error fetching leads:', error);
            res.status(500).json({ error: 'Failed to fetch leads' });
        }
    },

    // Update lead status (Kanban move)
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }

            const lead = await prisma.lead.update({
                where: { id },
                data: { status }
            });

            res.json(lead);
        } catch (error) {
            console.error('Error updating lead status:', error);
            res.status(500).json({ error: 'Failed to update lead status' });
        }
    }
};

module.exports = leadController;
