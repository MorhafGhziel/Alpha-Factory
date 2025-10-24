const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function fixOwnerRole() {
    try {
        console.log('🔍 Checking all users and their roles...');

        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        console.log('\n📋 Current users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role || 'NO ROLE'}`);
        });

        // Ask which user should be owner
        console.log('\n🔧 To make a user an owner, run:');
        console.log('node fix-owner-role.js <email>');
        console.log('\nExample: node fix-owner-role.js admin@alphafactory.net');

        // If email provided as argument
        const email = process.argv[2];
        if (email) {
            console.log(`\n🎯 Setting ${email} as owner...`);

            const updatedUser = await prisma.user.update({
                where: { email: email },
                data: { role: 'owner' },
            });

            console.log(`✅ Successfully updated ${updatedUser.name} to owner role!`);
            console.log('🔄 Please refresh your admin page to see the admin panel link.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixOwnerRole();
