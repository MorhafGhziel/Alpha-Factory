#!/usr/bin/env node

/**
 * Invoice Migration Script
 * 
 * This script helps migrate from localStorage-based invoice tracking
 * to database-backed invoice and payment tracking.
 * 
 * Usage:
 *   node scripts/migrate-invoices.js
 */

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting invoice migration...');

    try {
        // Check if we can connect to the database
        await prisma.$connect();
        console.log('✅ Database connection successful');

        // Check current state
        const existingInvoices = await prisma.invoice.count();
        console.log(`📊 Current invoices in database: ${existingInvoices}`);

        const existingPayments = await prisma.payment.count();
        console.log(`💳 Current payments in database: ${existingPayments}`);

        const totalUsers = await prisma.user.count();
        console.log(`👥 Total users: ${totalUsers}`);

        const totalProjects = await prisma.project.count();
        console.log(`📁 Total projects: ${totalProjects}`);

        if (existingInvoices === 0) {
            console.log('\n💡 No invoices found in database.');
            console.log('   Invoices will be automatically created when clients visit the invoice page.');
            console.log('   The new system includes a migration mode that will:');
            console.log('   1. Generate invoices from existing projects');
            console.log('   2. Allow clients to migrate their data with one click');
            console.log('   3. Preserve all existing functionality');
        } else {
            console.log('\n✅ Database already contains invoice data.');
        }

        console.log('\n🔧 Migration features:');
        console.log('   • Automatic fallback to legacy mode if database is empty');
        console.log('   • One-click migration button for clients');
        console.log('   • Backward compatibility with existing projects');
        console.log('   • PayPal integration automatically stores payments');
        console.log('   • Real-time payment status updates');

        console.log('\n📋 Next steps:');
        console.log('   1. Run: npx prisma db push (to apply schema changes)');
        console.log('   2. Restart your Next.js application');
        console.log('   3. Visit /client/invoices to test the new system');
        console.log('   4. Clients will see a migration button if needed');

    } catch (error) {
        console.error('❌ Migration check failed:', error);

        if (error.code === 'P1001') {
            console.log('\n💡 Database connection failed. Please:');
            console.log('   1. Make sure your DATABASE_URL is set in .env');
            console.log('   2. Ensure your database is running');
            console.log('   3. Run: npx prisma db push');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error('❌ Script failed:', e);
        process.exit(1);
    });
