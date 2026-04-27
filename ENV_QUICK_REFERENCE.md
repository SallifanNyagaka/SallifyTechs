# Quick Reference: Environment Variables

## 🚀 Quick Start for Vercel

```bash
# 1. Add all variables to Vercel Dashboard
#    Dashboard → Select Project → Settings → Environment Variables

# 2. Add these 31 variables with your values:

# CLIENT-SIDE (Public - use in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@yourdomain.com
NEXT_PUBLIC_USD_TO_KES_RATE=155

# SERVER-SIDE (Private - secret)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
SITE_URL=https://yourdomain.com
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+1...
OWNER_NOTIFICATION_EMAIL=owner@yourdomain.com
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=From Name <email@domain.com>
WHATSAPP_CLOUD_ACCESS_TOKEN=...
WHATSAPP_CLOUD_PHONE_NUMBER_ID=...
WHATSAPP_TEMPLATE_NAME=...
WHATSAPP_TEMPLATE_LANG=en_US
WHATSAPP_ADMIN_NUMBER=+254...
ENABLE_WHATSAPP_DELIVERY=true
INVOICE_TAX_ENABLED=true
INVOICE_TAX_RATE=0.16
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini

# 3. Deploy
vercel deploy --prod
```

## 📚 Documentation Files

- **[ENV_AUDIT.md](ENV_AUDIT.md)** - Full audit report (detailed)
- **[VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)** - Deployment guide (step-by-step)
- **[env.d.ts](env.d.ts)** - TypeScript definitions (for IDE support)

## 🔧 Helper Scripts

```bash
# Windows (PowerShell)
.\scripts\vercel-env-sync.ps1

# Linux/Mac (Bash)
bash scripts/vercel-env-sync.sh
```

## ✅ Verification Checklist

After adding variables to Vercel:

- [ ] Build succeeds locally: `npm run build`
- [ ] Vercel build succeeds (check deployment logs)
- [ ] Contact form sends emails
- [ ] Project requests work
- [ ] WhatsApp notifications send
- [ ] Invoice generation works
- [ ] Chat feature works
- [ ] Admin login works

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Build fails: "Cannot find module" | Variable missing in Vercel Dashboard |
| process.env.VAR is undefined on client | Variable name doesn't start with `NEXT_PUBLIC_` |
| Secrets visible in bundle | Server-side variable not using API route |
| Email not sending | Check SMTP_* variables in Vercel |

## 🔐 Security Notes

✅ **What's Safe to Expose (NEXT_PUBLIC_)**
- Firebase config (read-only API keys with limitations)
- Public URLs
- Google verification tokens
- Admin email lists

❌ **Never Expose (No NEXT_PUBLIC_)**
- API keys (OpenAI, Twilio, etc.)
- Credentials (SMTP password, OAuth tokens)
- Webhook verification tokens
- Private phone numbers

## 📞 Support

For issues or questions:
1. Check [ENV_AUDIT.md](ENV_AUDIT.md) - FAQs section
2. Read [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) - Troubleshooting
3. Review [env.d.ts](env.d.ts) - Variable descriptions
4. Check your local `.env.local` setup

---

**Last Updated**: April 27, 2026  
**Status**: ✅ Ready for Production
