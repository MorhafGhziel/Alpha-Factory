# PayPal Testing Guide 🧪

## Quick Start Testing

### Step 1: Create PayPal Test Accounts

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Login with your regular PayPal account
3. Navigate to **Sandbox** → **Accounts**
4. Click **Create Account**

**Create these accounts:**

- **Business Account** (Seller - receives payments)
- **Personal Account** (Buyer - makes payments)

### Step 2: Get Test Account Credentials

For each test account:

1. Click the **"..."** menu next to the account
2. Select **View/Edit Account**
3. Go to **Account credentials** tab
4. Note down the **Email** and **Password**

### Step 3: Test Payment Flow

1. **Start your app**: Navigate to `/client/dashboard`
2. **Find test section**: Look for "اختبار نظام الدفع"
3. **Create test invoice**: Click "إنشاء فاتورة تجريبية"
4. **Click PayPal button**: This opens PayPal in a new tab
5. **Login with test buyer account**: Use the Personal Account credentials
6. **Complete payment**: Follow PayPal's test flow
7. **Return to app**: Payment status will update automatically

## Important Notes ⚠️

### **No Real Money Involved**

- ✅ All transactions are **fake/simulated**
- ✅ No real money is charged or transferred
- ✅ Your main PayPal account is **not affected**
- ✅ Test accounts have **virtual funds** for testing

### **Test Account Details**

- **Business Account**: Receives the fake payments
- **Personal Account**: Makes the fake payments
- **Virtual Balance**: Test accounts start with $9,999.99 fake money

### **What Happens During Testing:**

1. You click PayPal button → Creates test payment order
2. PayPal opens in new tab → You login with test buyer account
3. You approve payment → PayPal processes fake transaction
4. You return to app → Payment marked as successful
5. Test business account → Shows fake payment received

## Sample Test Accounts

Here are the credentials format you'll see:

```
Business Account (Seller):
Email: sb-business123@business.example.com
Password: testpassword123

Personal Account (Buyer):
Email: sb-buyer456@personal.example.com
Password: testpassword456
```

## Testing Checklist ✅

- [ ] Created PayPal Developer account
- [ ] Created Business test account (seller)
- [ ] Created Personal test account (buyer)
- [ ] Noted down test account credentials
- [ ] App is running in development mode
- [ ] Environment variables are set to sandbox mode
- [ ] Tested payment flow with test accounts
- [ ] Verified payment success in app
- [ ] Checked test business account for received payment

## Troubleshooting 🔧

### **Common Issues:**

1. **"Login failed"** → Double-check test account credentials
2. **"Payment failed"** → Ensure test account has sufficient fake balance
3. **"Popup blocked"** → Allow popups for your localhost domain
4. **"Invalid credentials"** → Make sure you're using sandbox test accounts, not real accounts

### **Debug Steps:**

1. Check browser console for errors
2. Verify environment variables are correct
3. Ensure you're using test account credentials (not real PayPal account)
4. Check that `PAYPAL_MODE=sandbox` in your `.env.local`

## Moving to Production 🚀

When ready for real payments:

1. **Change environment variables:**

   ```bash
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_client_secret
   ```

2. **Test with real PayPal accounts** (small amounts first)
3. **Monitor payments** in your real PayPal business dashboard
4. **Update return URLs** to your production domain

## Need Help? 🆘

- **PayPal Sandbox Issues**: [PayPal Developer Support](https://developer.paypal.com/support/)
- **Test Account Problems**: Check PayPal Developer Dashboard
- **App Integration Issues**: Check browser console and server logs

---

**Remember**: Sandbox testing is completely safe - no real money is involved! 💰✨
