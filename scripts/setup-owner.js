require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function setupOwner() {
    console.log('🚀 Setting up Owner Account...\n');

    try {
        // Check if an owner already exists
        const existingOwner = await prisma.user.findFirst({
            where: { role: 'owner' }
        });

        if (existingOwner) {
            console.log('❌ Owner account already exists!');
            console.log(`Owner: ${existingOwner.name} (${existingOwner.email})`);
            return;
        }

        // Get owner details from environment or use defaults
        const ownerData = {
            name: process.env.OWNER_NAME || 'System Owner',
            email: process.env.OWNER_EMAIL || 'owner@gmail.com',
            password: process.env.OWNER_PASSWORD || '12311231',
        };

        console.log('Creating owner account with the following details:');
        console.log(`Name: ${ownerData.name}`);
        console.log(`Email: ${ownerData.email}`);
        console.log(`Password: ${ownerData.password}\n`);

        // Check if email is already taken
        const existingUser = await prisma.user.findUnique({
            where: { email: ownerData.email }
        });

        if (existingUser) {
            console.log('❌ Email already exists! Please use a different email.');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(ownerData.password, 12);
        const userId = crypto.randomUUID();

        // Create owner user
        const owner = await prisma.user.create({
            data: {
                id: userId,
                name: ownerData.name,
                email: ownerData.email,
                role: 'owner',
                emailVerified: true,
            }
        });

        // Create account record for password authentication
        await prisma.account.create({
            data: {
                id: crypto.randomUUID(),
                accountId: ownerData.email,
                providerId: 'credential',
                userId: owner.id,
                password: hashedPassword,
            }
        });

        console.log('✅ Owner account created successfully!');
        console.log('\n📋 Owner Account Details:');
        console.log(`ID: ${owner.id}`);
        console.log(`Name: ${owner.name}`);
        console.log(`Email: ${owner.email}`);
        console.log(`Role: ${owner.role}`);
        console.log(`Created: ${owner.createdAt}`);

        console.log('\n🔐 Login Credentials:');
        console.log(`Email: ${ownerData.email}`);
        console.log(`Password: ${ownerData.password}`);

        console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
        console.log('1. Please change the password after first login');
        console.log('2. Store these credentials securely');
        console.log('3. The owner role has full access to the admin panel');
        console.log('4. Only the owner can create, edit, and delete user accounts');

    } catch (error) {
        console.error('❌ Error creating owner account:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the setup if this file is executed directly
if (require.main === module) {
    setupOwner()
        .then(() => {
            console.log('\n🎉 Setup completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = { setupOwner };
