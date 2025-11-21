const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const statsController = {
    // Get general system statistics
    async getGeneralStats(req, res) {
        try {
            // Get current month date range
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Previous month for comparison
            const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            // Count total leads
            const totalLeads = await prisma.lead.count();
            const leadsThisMonth = await prisma.lead.count({
                where: {
                    createdAt: {
                        gte: firstDayOfMonth,
                        lte: lastDayOfMonth
                    }
                }
            });
            const leadsLastMonth = await prisma.lead.count({
                where: {
                    createdAt: {
                        gte: firstDayOfLastMonth,
                        lte: lastDayOfLastMonth
                    }
                }
            });

            // Calculate leads growth percentage
            const leadsGrowth = leadsLastMonth > 0
                ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100
                : 0;

            // Count active properties (AVAILABLE status)
            const activeProperties = await prisma.property.count({
                where: { status: 'AVAILABLE' }
            });
            const totalProperties = await prisma.property.count();

            // Get deals statistics
            const signedDealsThisMonth = await prisma.deal.findMany({
                where: {
                    status: 'Signed',
                    createdAt: {
                        gte: firstDayOfMonth,
                        lte: lastDayOfMonth
                    }
                },
                select: {
                    value: true,
                    commission: true
                }
            });

            const totalSalesThisMonth = signedDealsThisMonth.reduce((sum, deal) => sum + deal.value, 0);
            const totalCommissionThisMonth = signedDealsThisMonth.reduce((sum, deal) => sum + (deal.commission || 0), 0);

            // Get recent activities (last 10)
            const recentLeads = await prisma.lead.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    status: true
                }
            });

            const recentDeals = await prisma.deal.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    lead: {
                        select: { name: true }
                    },
                    property: {
                        select: { title: true }
                    }
                }
            });

            // Get upcoming appointments (next 7 days)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            const upcomingAppointments = await prisma.appointment.findMany({
                where: {
                    date: {
                        gte: today,
                        lte: nextWeek
                    },
                    completed: false
                },
                orderBy: { date: 'asc' },
                take: 10,
                include: {
                    lead: {
                        select: { name: true }
                    },
                    property: {
                        select: { title: true, city: true }
                    }
                }
            });

            // Leads by status distribution
            const leadsByStatus = await prisma.lead.groupBy({
                by: ['status'],
                _count: {
                    status: true
                }
            });

            const statusDistribution = leadsByStatus.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {});

            // Monthly deals trend (last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlyDeals = await prisma.deal.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: {
                        gte: sixMonthsAgo
                    }
                },
                _count: {
                    id: true
                },
                _sum: {
                    value: true
                }
            });

            res.json({
                leads: {
                    total: totalLeads,
                    thisMonth: leadsThisMonth,
                    growth: parseFloat(leadsGrowth.toFixed(2)),
                    byStatus: statusDistribution
                },
                properties: {
                    active: activeProperties,
                    total: totalProperties,
                    percentage: totalProperties > 0 ? ((activeProperties / totalProperties) * 100).toFixed(1) : 0
                },
                sales: {
                    thisMonth: totalSalesThisMonth,
                    dealsCount: signedDealsThisMonth.length,
                    commission: totalCommissionThisMonth
                },
                recentActivities: {
                    leads: recentLeads,
                    deals: recentDeals
                },
                upcomingAppointments: upcomingAppointments,
                trends: {
                    monthly: monthlyDeals
                }
            });
        } catch (error) {
            console.error('Error fetching general stats:', error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    }
};

module.exports = statsController;
