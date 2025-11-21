const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const userController = {
    // Get all users (for admin)
    async getAll(req, res) {
        try {
            const users = await prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                    status: true,
                    commissionRate: true,
                    createdAt: true,
                    _count: {
                        select: {
                            leads: true,
                            deals: true
                        }
                    }
                }
            });
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    },

    // Get user by ID
    async getById(req, res) {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                    status: true,
                    commissionRate: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    },

    // Create user (for admin)
    async create(req, res) {
        try {
            const { email, name, password, role, phone, status, commissionRate } = req.body;

            if (!email || !name) {
                return res.status(400).json({ error: 'Email and name are required' });
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Hash password if provided
            let hashedPassword = null;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role: role || 'AGENT',
                    phone,
                    status: status || 'Active',
                    commissionRate: commissionRate ? parseFloat(commissionRate) : null
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                    status: true,
                    commissionRate: true,
                    createdAt: true
                }
            });

            res.status(201).json(user);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    },

    // Update user
    async update(req, res) {
        try {
            const { id } = req.params;
            const { email, name, password, role, phone, status, commissionRate } = req.body;

            const updateData = {};

            if (email !== undefined) updateData.email = email;
            if (name !== undefined) updateData.name = name;
            if (role !== undefined) updateData.role = role;
            if (phone !== undefined) updateData.phone = phone;
            if (status !== undefined) updateData.status = status;
            if (commissionRate !== undefined) {
                updateData.commissionRate = commissionRate ? parseFloat(commissionRate) : null;
            }

            // Hash password if provided
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            const user = await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                    status: true,
                    commissionRate: true,
                    updatedAt: true
                }
            });

            res.json(user);
        } catch (error) {
            console.error('Error updating user:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(500).json({ error: 'Failed to update user' });
        }
    },

    // Delete user
    async delete(req, res) {
        try {
            const { id } = req.params;

            await prisma.user.delete({
                where: { id }
            });

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
};

module.exports = userController;
