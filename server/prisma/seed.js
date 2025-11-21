const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    // Create a default owner
    const owner = await prisma.owner.upsert({
        where: { id: 'default-owner' },
        update: {},
        create: {
            id: 'default-owner',
            name: 'Vendo Ideias Proprietário',
            email: 'proprietario@vendoideias.com.br',
            phone: '11999999999',
            docNumber: '000.000.000-00',
            type: 'PF'
        },
    });

    // Create admin user with new credentials
    const hashedPassword = await bcrypt.hash('vendoideias1010', 10);
    const user = await prisma.user.upsert({
        where: { email: 'vendoideias' },
        update: { password: hashedPassword },
        create: {
            email: 'vendoideias',
            name: 'Admin Vendo Ideias',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    console.log({
        owner,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            password: '[HIDDEN]'
        }
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
