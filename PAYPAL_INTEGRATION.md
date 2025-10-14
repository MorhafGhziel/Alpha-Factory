# PayPal Integration Documentation

## Overview

This document describes the PayPal payment integration implemented for Alpha Factory client invoices. The integration allows clients to pay for their project invoices using PayPal's secure payment system.

## Features

- ✅ PayPal Sandbox and Production support
- ✅ Secure payment processing
- ✅ Automatic payment capture
- ✅ Payment status tracking
- ✅ Invoice-based payments
- ✅ Success/Cancel handling
- ✅ Real-time payment notifications
- ✅ Test invoice component for development

## Environment Variables

The following environment variables are required in your `.env.local` file:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or "live" for production

# Better Auth URL (for return URLs)
BETTER_AUTH_URL=http://localhost:3000  # or your production URL
```

## API Endpoints

### 1. Create Payment

**POST** `/api/paypal/create-payment`

Creates a PayPal payment order.

**Request Body:**

```json
{
  "amount": 100.0,
  "currency": "USD",
  "description": "Alpha Factory Invoice Payment",
  "invoiceId": "invoice_123"
}
```

**Response:**

```json
{
  "success": true,
  "orderId": "paypal_order_id",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "order": {
    /* PayPal order object */
  }
}
```

### 2. Capture Payment

**POST** `/api/paypal/capture-payment`

Captures a PayPal payment after user approval.

**Request Body:**

```json
{
  "orderId": "paypal_order_id"
}
```

**Response:**

```json
{
  "success": true,
  "status": "COMPLETED",
  "transactionId": "transaction_id",
  "amount": {
    "currency_code": "USD",
    "value": "100.00"
  }
}
```

### 3. Handle Return

**GET** `/api/paypal/handle-return?token=ORDER_ID&PayerID=PAYER_ID`

Handles PayPal return after user completes payment.

**Response:**

```json
{
  "success": true,
  "status": "COMPLETED",
  "transactionId": "transaction_id",
  "amount": {
    /* amount object */
  },
  "referenceId": "invoice_123",
  "payerId": "payer_id"
}
```

## Components

### PayPalButton Component

Location: `/components/ui/PayPalButton.tsx`

A reusable PayPal payment button component.

**Props:**

```typescript
interface PayPalButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  invoiceId?: string;
  onSuccess?: (transactionData: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
}
```

**Usage:**

```tsx
<PayPalButton
  amount={100}
  description="Alpha Factory Invoice Payment"
  invoiceId="invoice_123"
  onSuccess={(data) => console.log("Payment successful:", data)}
  onError={(error) => console.error("Payment error:", error)}
  onCancel={() => console.log("Payment cancelled")}
/>
```

### TestPayPalInvoice Component

Location: `/components/ui/TestPayPalInvoice.tsx`

A test component for development and testing PayPal payments.

**Features:**

- Creates a sample invoice
- Integrates PayPal payment button
- Shows payment status
- Handles success/error states

## Integration in Invoice Page

The invoice page (`/src/app/client/invoices/page.tsx`) has been updated to include:

1. **PayPal Button Integration**: Real PayPal buttons replace the mock buttons
2. **Payment Status Handling**: Shows success/error messages
3. **Return URL Handling**: Processes PayPal returns automatically
4. **Invoice Marking**: Automatically marks invoices as paid after successful payment

## Payment Flow

1. **User clicks PayPal button** → Creates payment order via `/api/paypal/create-payment`
2. **Redirect to PayPal** → User completes payment on PayPal's secure site
3. **Return to application** → PayPal redirects back with payment token
4. **Capture payment** → Application captures payment via `/api/paypal/handle-return`
5. **Update invoice status** → Invoice is marked as paid in the application

## Testing

### Sandbox Testing

1. Use PayPal Sandbox credentials
2. Set `PAYPAL_MODE=sandbox` in environment variables
3. Use test PayPal accounts for payments
4. Access the test invoice component at `/client/dashboard`

### Test Accounts

Create test accounts at [PayPal Developer Dashboard](https://developer.paypal.com/):

- **Buyer Account**: For testing payments
- **Seller Account**: For receiving payments

### Test Invoice Component

A test invoice component is available on the client dashboard for easy testing:

- Navigate to `/client/dashboard`
- Look for "اختبار نظام الدفع" section
- Click "إنشاء فاتورة تجريبية" to test payments

## Security Features

1. **Server-side validation**: All payments are validated on the server
2. **Secure credentials**: PayPal credentials are stored securely in environment variables
3. **Payment verification**: Each payment is verified with PayPal before marking as complete
4. **User authentication**: Only authenticated users can create payments

## Error Handling

The integration includes comprehensive error handling:

- Network errors
- PayPal API errors
- Invalid payment amounts
- Authentication failures
- Payment capture failures

## Production Deployment

To deploy to production:

1. **Update environment variables**:

   ```bash
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_client_secret
   BETTER_AUTH_URL=https://your-domain.com
   ```

2. **Test thoroughly** with real PayPal accounts
3. **Monitor payments** through PayPal dashboard
4. **Set up webhooks** (optional) for additional payment notifications

## Troubleshooting

### Common Issues

1. **"Invalid origin" errors**: Check `BETTER_AUTH_URL` matches your domain
2. **Payment creation fails**: Verify PayPal credentials and mode
3. **Return URL not working**: Ensure return URLs are correctly configured
4. **Amount validation errors**: Check amount is positive number

### Debug Mode

Enable debug logging by checking browser console and server logs for detailed error information.

## Future Enhancements

Potential improvements:

- [ ] Webhook integration for real-time payment notifications
- [ ] Recurring payment support
- [ ] Multiple currency support
- [ ] Payment history tracking
- [ ] Refund functionality
- [ ] PayPal Express Checkout integration

## Support

For PayPal-specific issues:

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal REST API Reference](https://developer.paypal.com/docs/api/)
- [PayPal Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox/)

For application-specific issues, check the server logs and browser console for detailed error messages.
