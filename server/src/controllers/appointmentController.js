const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const appointmentController = {
    // Create a new appointment
    async create(req, res) {
        try {
            const {
                title,
                description,
                scheduledAt,
                duration,
                leadId,
                propertyId,
                userId,
                status
            } = req.body;

            // Basic validation
            if (!title || !scheduledAt) {
                return res.status(400).json({ error: 'Title and scheduledAt are required' });
            }

            const appointment = await prisma.appointment.create({
                data: {
                    title,
                    description,
                    scheduledAt: new Date(scheduledAt),
                    duration: duration || 60, // Default 60 minutes
                    leadId: leadId || null,
                    propertyId: propertyId || null,
                    userId: userId || null,
                    status: status || 'SCHEDULED'
                },
                include: {
                    lead: {
                        select: { name: true, phone: true }
                    },
                    property: {
                        select: { title: true, address: true, city: true }
                    },
                    user: {
                        select: { name: true, email: true }
                    }
                }
            });

            res.status(201).json(appointment);
        } catch (error) {
            console.error('Error creating appointment:', error);
            res.status(500).json({ error: 'Failed to create appointment' });
        }
    },

    // Get all appointments with filters
    async getAll(req, res) {
        try {
            const { startDate, endDate, status, userId } = req.query;

            const where = {};

            if (startDate || endDate) {
                where.scheduledAt = {};
                if (startDate) where.scheduledAt.gte = new Date(startDate);
                if (endDate) where.scheduledAt.lte = new Date(endDate);
            }

            if (status) where.status = status;
            if (userId) where.userId = userId;

            const appointments = await prisma.appointment.findMany({
                where,
                include: {
                    lead: {
                        select: { name: true, phone: true }
                    },
                    property: {
                        select: { title: true, address: true, city: true }
                    },
                    user: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: { scheduledAt: 'asc' }
            });

            res.json(appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            res.status(500).json({ error: 'Failed to fetch appointments' });
        }
    },

    // Get single appointment by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const appointment = await prisma.appointment.findUnique({
                where: { id },
                include: {
                    lead: true,
                    property: true,
                    user: true
                }
            });

            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            res.json(appointment);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch appointment' });
        }
    },

    // Update appointment
    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                scheduledAt,
                duration,
                status,
                leadId,
                propertyId,
                userId
            } = req.body;

            const updateData = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
            if (duration !== undefined) updateData.duration = duration;
            if (status !== undefined) updateData.status = status;
            if (leadId !== undefined) updateData.leadId = leadId;
            if (propertyId !== undefined) updateData.propertyId = propertyId;
            if (userId !== undefined) updateData.userId = userId;

            const appointment = await prisma.appointment.update({
                where: { id },
                data: updateData,
                include: {
                    lead: {
                        select: { name: true, phone: true }
                    },
                    property: {
                        select: { title: true, address: true, city: true }
                    },
                    user: {
                        select: { name: true, email: true }
                    }
                }
            });

            res.json(appointment);
        } catch (error) {
            console.error('Error updating appointment:', error);
            res.status(500).json({ error: 'Failed to update appointment' });
        }
    },

    // Delete appointment
    async delete(req, res) {
        try {
            const { id } = req.params;

            await prisma.appointment.delete({
                where: { id }
            });

            res.json({ message: 'Appointment deleted successfully' });
        } catch (error) {
            console.error('Error deleting appointment:', error);
            res.status(500).json({ error: 'Failed to delete appointment' });
        }
    }
};

module.exports = appointmentController;
