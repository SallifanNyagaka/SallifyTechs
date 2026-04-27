#!/bin/bash

# Vercel Environment Variables Sync Script
# This script lists all environment variables that need to be added to Vercel
# Works with: Vercel CLI (https://vercel.com/docs/cli)

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Sallify Portfolio - Vercel Environment Variables Sync${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI not found${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✓ Vercel CLI detected${NC}\n"

# Display environment variables organized by category
echo -e "${YELLOW}CLIENT-SIDE VARIABLES (NEXT_PUBLIC_)${NC}"
echo -e "${YELLOW}These are exposed to the browser and are public${NC}\n"

CLIENT_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"
    "NEXT_PUBLIC_SITE_URL"
    "NEXT_PUBLIC_ADMIN_EMAILS"
    "NEXT_PUBLIC_USD_TO_KES_RATE"
)

for var in "${CLIENT_VARS[@]}"; do
    echo "  $var"
done

echo -e "\n${YELLOW}SERVER-SIDE VARIABLES (SENSITIVE - Private)${NC}"
echo -e "${YELLOW}These should NEVER be exposed to the browser${NC}\n"

SERVER_VARS=(
    "WHATSAPP_WEBHOOK_VERIFY_TOKEN"
    "SITE_URL"
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_WHATSAPP_FROM"
    "OWNER_NOTIFICATION_EMAIL"
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASS"
    "SMTP_FROM"
    "WHATSAPP_CLOUD_ACCESS_TOKEN"
    "WHATSAPP_CLOUD_PHONE_NUMBER_ID"
    "WHATSAPP_TEMPLATE_NAME"
    "WHATSAPP_TEMPLATE_LANG"
    "WHATSAPP_ADMIN_NUMBER"
    "ENABLE_WHATSAPP_DELIVERY"
    "INVOICE_TAX_ENABLED"
    "INVOICE_TAX_RATE"
    "OPENAI_API_KEY"
    "OPENAI_CHAT_MODEL"
)

for var in "${SERVER_VARS[@]}"; do
    echo "  $var"
done

echo -e "\n${BLUE}═════════════════════════════════════════════════════════════${NC}\n"

# Option to export to file
read -p "Export environment variable names to .env.example? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    {
        echo "# Generated on $(date)"
        echo "# Client-Side Variables (NEXT_PUBLIC_)"
        for var in "${CLIENT_VARS[@]}"; do
            echo "$var="
        done
        echo ""
        echo "# Server-Side Variables (Sensitive)"
        for var in "${SERVER_VARS[@]}"; do
            echo "$var="
        done
    } > .env.example
    echo -e "${GREEN}✓ Exported to .env.example${NC}"
fi

echo -e "\n${BLUE}MANUAL SETUP INSTRUCTIONS:${NC}"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your 'sallify_portfolio' project"
echo "3. Settings → Environment Variables"
echo "4. Add each variable from the lists above with their values"
echo "5. Redeploy the project"

echo -e "\n${BLUE}OR use Vercel CLI:${NC}"
echo -e "  ${YELLOW}vercel env pull${NC}  (pulls environment from Vercel)"
echo -e "  ${YELLOW}vercel deploy${NC}   (deploys with environment variables)"

echo -e "\n${BLUE}═════════════════════════════════════════════════════════════${NC}\n"
