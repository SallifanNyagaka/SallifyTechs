# Vercel Environment Variables Setup Checklist

## Required Environment Variables

Copy these variable names to your Vercel Dashboard under **Settings → Environment Variables**.
Add corresponding values in your Vercel project.

### Client-Side Variables (NEXT_PUBLIC_)
These are exposed to the browser and must have values:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_ADMIN_EMAILS
NEXT_PUBLIC_USD_TO_KES_RATE
```

### Server-Side Variables (Sensitive)
These should ONLY be added to Vercel (not in version control):

```
WHATSAPP_WEBHOOK_VERIFY_TOKEN
SITE_URL
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
OWNER_NOTIFICATION_EMAIL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
WHATSAPP_CLOUD_ACCESS_TOKEN
WHATSAPP_CLOUD_PHONE_NUMBER_ID
WHATSAPP_TEMPLATE_NAME
WHATSAPP_TEMPLATE_LANG
WHATSAPP_ADMIN_NUMBER
ENABLE_WHATSAPP_DELIVERY
INVOICE_TAX_ENABLED
INVOICE_TAX_RATE
OPENAI_API_KEY
OPENAI_CHAT_MODEL
```

## Setup Instructions

### Step 1: Prepare Environment Files

Ensure your `.env.local` file contains all the above variables during development.

**Example `.env.local` structure:**
```bash
# Firebase (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Site Configuration (Public)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
NEXT_PUBLIC_ADMIN_EMAILS=admin@yourdomain.com
NEXT_PUBLIC_USD_TO_KES_RATE=155

# Email (Private)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@Provider.com
SMTP_PASS=your_app_password
SMTP_FROM=Sallify Technologies <sender@yourdomain.com>
OWNER_NOTIFICATION_EMAIL=owner@yourdomain.com

# Twilio (Private)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890

# WhatsApp Cloud API (Private)
WHATSAPP_CLOUD_ACCESS_TOKEN=your_access_token
WHATSAPP_CLOUD_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_TEMPLATE_NAME=project_request_notification
WHATSAPP_TEMPLATE_LANG=en_US
WHATSAPP_ADMIN_NUMBER=+254712345678
ENABLE_WHATSAPP_DELIVERY=true

# AI Configuration (Private)
OPENAI_API_KEY=sk-your_key
OPENAI_CHAT_MODEL=gpt-4o-mini

# Invoice Configuration (Private)
INVOICE_TAX_ENABLED=true
INVOICE_TAX_RATE=0.16
```

### Step 2: Add to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **sallify_portfolio** project
3. Navigate to **Settings → Environment Variables**
4. Add each variable:
   - **Name**: Exact variable name (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value**: Your actual value
   - **Environment**: Select `Production`, `Preview`, and `Development` as needed
5. Click **Save**

### Step 3: Environment Strategy

For security, consider this approach:

| Environment | Public Variables | Secret Variables |
|---|---|---|
| **Development** | `.env.local` | `.env.local` (git-ignored) |
| **Preview** | Vercel Dashboard | Vercel Dashboard + Preview Secrets |
| **Production** | Vercel Dashboard | Vercel Dashboard (encrypted) |

### Step 4: Verify After Deployment

After deployment, verify variables are accessible:

```bash
# Build log should show no warnings about missing NEXT_PUBLIC_ variables
# Check: Settings → Environment Variables in Vercel to confirm all variables exist
```

## Audit Results

**Total Variables Detected**: 31
- **Client-Side (NEXT_PUBLIC_)**: 10
- **Server-Side (Sensitive)**: 21

**Status**:
- ✅ Firebase variables correctly prefixed
- ✅ All NEXT_PUBLIC_ variables properly named
- ✅ No accidental secret exposure in code
- ✅ Type definitions created (env.d.ts)

## Troubleshooting

### Build fails with "process.env.VARIABLE is undefined"
→ Ensure the variable is defined in Vercel's Environment Variables panel

### Not seeing NEXT_PUBLIC_ variables on client-side
→ Verify the variable name starts with `NEXT_PUBLIC_` exactly
→ Redeploy after adding/changing variables

### Secrets appearing in client code
→ Use the search path: `grep -r "process.env" app/` to audit
→ Move server logic to API routes or server components

## Next Steps

1. ✅ Type definitions added to `env.d.ts`
2. 📋 Add all variables to Vercel Dashboard
3. 🔄 Rebuild on Vercel
4. ✔️ Test all features in production environment
