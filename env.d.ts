/**
 * Environment Variable Type Definitions
 * 
 * Client-side variables (NEXT_PUBLIC_) are exposed to the browser.
 * Server-side variables are only available on the server.
 * 
 * Reference: https://nextjs.org/docs/basic-features/environment-variables
 */

namespace NodeJS {
  interface ProcessEnv {
    // ============================================
    // Client-Side Variables (NEXT_PUBLIC_)
    // ============================================
    /** Firebase API Key */
    NEXT_PUBLIC_FIREBASE_API_KEY: string
    /** Firebase Auth Domain */
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string
    /** Firebase Project ID */
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
    /** Firebase Storage Bucket */
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string
    /** Firebase Messaging Sender ID */
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
    /** Firebase App ID */
    NEXT_PUBLIC_FIREBASE_APP_ID: string
    /** Google Site Verification ID for SEO */
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?: string
    /** Site URL (domain with protocol) */
    NEXT_PUBLIC_SITE_URL?: string
    /** Comma-separated admin email addresses */
    NEXT_PUBLIC_ADMIN_EMAILS?: string
    /** USD to KES exchange rate fallback */
    NEXT_PUBLIC_USD_TO_KES_RATE?: string

    // ============================================
    // Server-Side Variables (API Routes & Server Components)
    // ============================================
    
    // WhatsApp Webhook
    /** WhatsApp webhook verification token */
    WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string
    
    // Site Configuration (Server-side fallback)
    /** Site URL for server-side operations */
    SITE_URL?: string
    
    // Twilio (SMS/WhatsApp)
    /** Twilio Account SID */
    TWILIO_ACCOUNT_SID?: string
    /** Twilio Auth Token */
    TWILIO_AUTH_TOKEN?: string
    /** Twilio WhatsApp sender number */
    TWILIO_WHATSAPP_FROM?: string
    
    // Email Configuration
    /** Owner notification email address */
    OWNER_NOTIFICATION_EMAIL?: string
    /** SMTP server hostname */
    SMTP_HOST?: string
    /** SMTP server port */
    SMTP_PORT?: string
    /** SMTP authentication username */
    SMTP_USER?: string
    /** SMTP authentication password */
    SMTP_PASS?: string
    /** SMTP from email address */
    SMTP_FROM?: string
    
    // WhatsApp Cloud API
    /** WhatsApp Cloud API access token */
    WHATSAPP_CLOUD_ACCESS_TOKEN?: string
    /** WhatsApp Cloud API phone number ID */
    WHATSAPP_CLOUD_PHONE_NUMBER_ID?: string
    /** WhatsApp message template name */
    WHATSAPP_TEMPLATE_NAME?: string
    /** WhatsApp template language code */
    WHATSAPP_TEMPLATE_LANG?: string
    /** WhatsApp admin number for notifications */
    WHATSAPP_ADMIN_NUMBER?: string
    
    // Delivery Features
    /** Enable WhatsApp delivery feature */
    ENABLE_WHATSAPP_DELIVERY?: string
    
    // Invoice Configuration
    /** Enable invoice tax calculation */
    INVOICE_TAX_ENABLED?: string
    /** Invoice tax rate (decimal, e.g., "0.16" for 16%) */
    INVOICE_TAX_RATE?: string
    
    // AI Configuration
    /** OpenAI API Key */
    OPENAI_API_KEY?: string
    /** OpenAI chat model to use */
    OPENAI_CHAT_MODEL?: string
    
    // Standard Node.js Variables
    /** Node environment (development, production, test) */
    NODE_ENV: "development" | "production" | "test"
  }
}

export {}
