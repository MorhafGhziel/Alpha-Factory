# Owner Role Setup Guide

This guide explains how to set up and use the new **Owner** role in Alpha Factory, which provides comprehensive admin panel access for account management.

## What's New

### Owner Role

- **Superior to Admin**: The Owner role is the highest privilege level in the system
- **Exclusive Admin Panel Access**: Only owners can access the admin panel at `/admin`
- **Full Account Management**: Create, edit, delete, and manage all user accounts
- **Role Assignment**: Assign roles to users (admin, client, designer, reviewer, editor)
- **Security**: Cannot be deleted by other users, including other owners

### Admin Panel Features

- 📊 **User Dashboard**: View all users with detailed information
- ➕ **Create Accounts**: Add new users with any role
- ✏️ **Edit Users**: Modify user details, roles, and passwords
- 🗑️ **Delete Accounts**: Remove users (except other owners)
- 👥 **Group Management**: Assign users to groups
- 🔐 **Password Management**: Reset user passwords

## Setup Instructions

### 1. Create the First Owner Account

Run the setup script to create your first owner account:

```bash
# Using default credentials
node scripts/setup-owner.js

# Using custom credentials via environment variables
OWNER_NAME="Your Name" OWNER_EMAIL="your@email.com" OWNER_PASSWORD="YourSecurePassword123!" node scripts/setup-owner.js
```

### 2. Default Credentials

If no environment variables are provided, the script creates an owner with:

- **Name**: System Owner
- **Email**: owner@alphafactory.com
- **Password**: ChangeMe123!

⚠️ **IMPORTANT**: Change the password immediately after first login!

### 3. Login Process

1. Go to your application's login page
2. Enter the owner credentials
3. You'll be automatically redirected to `/admin`
4. Change your password in the profile section

## Admin Panel Usage

### Accessing the Admin Panel

- **URL**: `/admin`
- **Access**: Only users with `owner` role
- **Redirect**: Owners are automatically redirected here after login

### Managing Users

#### Creating New Users

1. Click "إضافة حساب جديد" (Add New Account)
2. Fill in the required information:
   - Name (required)
   - Email (required)
   - Password (required)
   - Role (required)
   - Username (optional)
   - Phone (optional)
   - Group (optional)
3. Click "إنشاء الحساب" (Create Account)

#### Editing Users

1. Find the user in the table
2. Click "تعديل" (Edit)
3. Modify any field (leave password empty to keep current)
4. Click "تحديث الحساب" (Update Account)

#### Deleting Users

1. Find the user in the table
2. Click "حذف" (Delete)
3. Confirm deletion in the popup
4. User will be permanently removed

### User Roles

The system supports these roles:

- **Owner** (مالك): Full system access - can manage all accounts
- **Admin** (مدير): Administrative access to their assigned areas
- **Client** (عميل): Client dashboard access
- **Designer** (مصمم): Designer tools and projects
- **Reviewer** (مراجع): Review and approval workflows
- **Editor** (محرر): Content editing capabilities

## Security Features

### Owner Protection

- Owners cannot delete themselves
- Owners cannot delete other owner accounts
- Owner accounts cannot be modified by non-owners
- Owner role cannot be changed by non-owners

### Access Control

- Admin panel is completely restricted to owners only
- API endpoints validate owner role before allowing operations
- All user management operations require owner authentication

### Password Security

- Passwords are hashed using bcrypt with 12 rounds
- Password changes are immediately effective
- No plain text passwords stored in database

## API Endpoints

### User Management APIs (Owner Only)

- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

All endpoints require owner role authentication.

## Troubleshooting

### Can't Access Admin Panel

- Verify your user has the `owner` role in the database
- Check that you're logged in with the correct account
- Clear browser cache and cookies

### Setup Script Issues

- Ensure database is running and accessible
- Check that Prisma client is properly configured
- Verify all dependencies are installed (`npm install`)

### Password Problems

- Use the admin panel to reset user passwords
- Ensure new passwords meet security requirements
- Check that bcrypt is properly installed

## Environment Variables

You can customize the initial owner setup using these environment variables:

```bash
OWNER_NAME="Your Full Name"
OWNER_EMAIL="owner@yourdomain.com"
OWNER_PASSWORD="YourSecurePassword123!"
```

## Best Practices

1. **Change Default Password**: Always change the default password immediately
2. **Secure Email**: Use a secure, monitored email address for the owner account
3. **Limited Owners**: Keep the number of owner accounts minimal
4. **Regular Audits**: Periodically review user accounts and permissions
5. **Backup Access**: Ensure you have database access to recover if needed

## Support

If you encounter issues with the owner setup or admin panel:

1. Check the console for error messages
2. Verify database connectivity
3. Ensure all migrations have been run
4. Check the application logs for detailed error information

---

**⚠️ Security Warning**: The owner role has complete control over all user accounts. Protect owner credentials carefully and limit access to trusted administrators only.
