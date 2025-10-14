# WhatsApp Business API Integration Setup (Facebook/Meta)

This document explains how to set up the official WhatsApp Business API integration for Alpha Factory client communications using Facebook's platform.

## Features

- **Client Credential Delivery**: When admin creates client accounts, credentials are sent via WhatsApp instead of email
- **Project Updates**: Send project updates directly to client's WhatsApp
- **Phone Number Storage**: Client phone numbers are stored and managed separately from employee emails
- **Arabic Support**: All messages are sent in Arabic for better client experience
- **Official API**: Uses Facebook's official WhatsApp Business API for reliability

## Setup Instructions

### 1. Facebook Developer Account Setup

#### Step 1: Create Facebook App

1. **Go to [Facebook Developers](https://developers.facebook.com/)**
2. **Click "Create App"**
3. **Select "Business"** as app type
4. **Fill in app details**:
   - App Name: "Alpha Factory WhatsApp"
   - App Contact Email: your business email
   - Business Account: Select your business account (or create one)

#### Step 2: Add WhatsApp Product

1. **In your app dashboard**, click "Add Product"
2. **Find "WhatsApp"** and click "Set Up"
3. **Select your Business Account** (or create one)
4. **Add a phone number** for WhatsApp Business

#### Step 3: Get API Credentials

1. **Go to WhatsApp > Getting Started**
2. **Copy your temporary access token** (valid for 24 hours)
3. **Note your Phone Number ID** (looks like: 123456789012345)
4. **Note your WhatsApp Business Account ID**

#### Step 4: Generate Permanent Access Token

1. **Go to Business Settings** (from your app dashboard)
2. **Click "System Users"** in the left menu
3. **Create a System User**:
   - Name: "Alpha Factory API"
   - Role: Admin
4. **Generate Access Token**:
   - Select your WhatsApp app
   - Select permissions: `whatsapp_business_messaging`
   - Token will never expire
5. **Copy and save this permanent token**

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# WhatsApp Business API Configuration (Facebook/Meta)
WHATSAPP_API_URL="https://graph.facebook.com/v18.0"
WHATSAPP_ACCESS_TOKEN="your_permanent_access_token_here"
WHATSAPP_PHONE_NUMBER_ID="123456789012345"  # Your Phone Number ID from Step 3
```

**Example with real values:**

```env
WHATSAPP_API_URL="https://graph.facebook.com/v18.0"
WHATSAPP_ACCESS_TOKEN="EAABxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
WHATSAPP_PHONE_NUMBER_ID="109876543210987"
```

### 3. Message Templates (Required for Production)

For production use, you need pre-approved message templates:

#### Step 1: Create Templates in Facebook Business Manager

1. **Go to Business Manager > WhatsApp Manager**
2. **Click "Message Templates"**
3. **Create new template**

#### Template 1: Account Credentials

```
Template Name: account_credentials_ar
Category: ACCOUNT_UPDATE
Language: Arabic (ar)

Header: None
Body:
🎉 مرحباً {{1}}!

تم إنشاء حسابك في Alpha Factory بنجاح!

📋 بيانات الدخول:
👤 اسم المستخدم: {{2}}
🔐 كلمة المرور: {{3}}
🏢 المجموعة: {{4}}

🔗 رابط الموقع:
https://alphafactory.com

⚠️ مهم: احتفظ بهذه البيانات في مكان آمن

فريق Alpha Factory 🚀

Footer: None
Buttons: None
```

#### Template 2: Project Updates

```
Template Name: project_update_ar
Category: ACCOUNT_UPDATE
Language: Arabic (ar)

Header: None
Body:
📢 تحديث مشروع {{1}}

مرحباً {{2}}،

{{3}}

لمتابعة تفاصيل أكثر، يرجى تسجيل الدخول إلى حسابك:
https://alphafactory.com

فريق Alpha Factory 🚀

Footer: None
Buttons: None
```

### 4. Phone Number Verification

#### For Testing (Development):

- You can send messages to your own number immediately
- Add test numbers in WhatsApp Manager > Phone Numbers

#### For Production:

1. **Verify your business** in Business Manager
2. **Submit for review** your message templates
3. **Wait for approval** (usually 1-3 business days)
4. **Increase sending limits** by demonstrating good messaging practices

### 5. Testing the Setup

#### Development Testing:

```bash
# Test API connection
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "966501234567",
    "type": "text",
    "text": {
      "body": "Test message from Alpha Factory"
    }
  }'
```

#### Application Testing:

1. **Restart your application** after adding environment variables
2. **Create a test client account** in the admin panel
3. **Check if WhatsApp message is sent** to the client's phone
4. **Verify the message content** is in Arabic

### 6. Phone Number Formatting

The system automatically formats Saudi phone numbers:

- Input: `0501234567` → Output: `966501234567`
- Input: `+966501234567` → Output: `966501234567`
- Input: `966501234567` → Output: `966501234567`

### 7. Message Limits and Pricing

#### Development/Testing:

- **1,000 free messages** per month
- **Rate limit**: 80 messages per second
- **No business verification required**

#### Production:

- **Conversation-based pricing**: ~$0.005-$0.10 per conversation
- **24-hour conversation window**
- **Higher rate limits** after business verification
- **Template messages required** for first contact

### 8. Webhook Setup (Optional)

For delivery status and message replies:

#### Step 1: Configure Webhook URL

```env
WHATSAPP_WEBHOOK_URL="https://yourdomain.com/api/whatsapp/webhook"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_custom_verification_token"
```

#### Step 2: Set up in Facebook Developer Console

1. **Go to WhatsApp > Configuration**
2. **Add webhook URL** and verify token
3. **Subscribe to message events**

### 9. Business Verification (For Production)

#### Required Documents:

- **Business registration certificate**
- **Tax ID or business license**
- **Proof of business address**
- **Business website or social media**

#### Verification Process:

1. **Submit business information** in Business Manager
2. **Upload required documents**
3. **Wait for review** (5-7 business days)
4. **Complete additional verification** if requested

### 10. Error Handling

#### Common Issues:

**1. "Invalid Access Token"**

- Check if token is correct and hasn't expired
- Regenerate permanent token if needed

**2. "Phone Number Not Registered"**

- Add recipient number to test numbers
- Or complete business verification for production

**3. "Template Not Found" (Production)**

- Make sure message templates are approved
- Use exact template names and parameters

**4. "Rate Limit Exceeded"**

- Reduce message frequency
- Upgrade to higher tier after business verification

### 11. Security Best Practices

- **Never expose access tokens** in client-side code
- **Use environment variables** for all credentials
- **Rotate access tokens** periodically
- **Use HTTPS** for all webhook endpoints
- **Validate webhook signatures** to prevent spoofing

### 12. Monitoring and Analytics

#### Facebook Analytics:

- **Message delivery rates**
- **Read rates**
- **Response rates**
- **Error analytics**

#### Application Logs:

- **Monitor WhatsApp API responses**
- **Track message delivery status**
- **Log errors for debugging**

## Quick Start Checklist

- [ ] Create Facebook Developer account
- [ ] Create business app
- [ ] Add WhatsApp product
- [ ] Get Phone Number ID and access token
- [ ] Generate permanent access token
- [ ] Add environment variables to `.env`
- [ ] Test with your own phone number
- [ ] Create message templates (for production)
- [ ] Submit for business verification (for production)
- [ ] Test client account creation
- [ ] Verify message delivery

**Development setup time: 15-30 minutes**
**Production ready: 3-7 days (after verification)**

## Support and Documentation

- **WhatsApp Business API Docs**: https://developers.facebook.com/docs/whatsapp
- **Business Manager Help**: https://www.facebook.com/business/help
- **API Reference**: https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account
- **Message Templates Guide**: https://developers.facebook.com/docs/whatsapp/message-templates

## Cost Estimation

#### Monthly Costs (Production):

- **100 clients**: ~$5-15/month
- **500 clients**: ~$25-75/month
- **1000 clients**: ~$50-150/month

_Costs depend on conversation frequency and message types_

## Migration from Development to Production

1. **Complete business verification**
2. **Submit message templates for approval**
3. **Update rate limiting in application**
4. **Monitor delivery rates and adjust**
5. **Set up proper error handling and retries**
