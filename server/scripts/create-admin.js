const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('vendo1010', 10);

        const user = await prisma.user.upsert({
            where: { email: 'vendoideias' },
            update: {},
            create: {
                email: 'vendoideias',
                name: 'Administrador',
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        console.log('✓ Admin user created/verified:', user.email);
        console.log('  Login: vendoideias');
        console.log('  Password: vendo1010');
    } catch (error) {
        console.error('Error creating admin user:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
