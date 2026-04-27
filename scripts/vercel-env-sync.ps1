# Vercel Environment Variables Sync Script (PowerShell)
# This script lists all environment variables that need to be added to Vercel
# Works with: Vercel CLI (https://vercel.com/docs/cli)

# Color helper function
function Write-ColorOutput($color, $message) {
    $colors = @{
        'Green'  = [System.ConsoleColor]::Green
        'Blue'   = [System.ConsoleColor]::Cyan
        'Yellow' = [System.ConsoleColor]::Yellow
        'Red'    = [System.ConsoleColor]::Red
    }
    Write-Host $message -ForegroundColor $colors[$color]
}

Write-ColorOutput "Blue" "═════════════════════════════════════════════════════════════"
Write-ColorOutput "Blue" "Sallify Portfolio - Vercel Environment Variables Sync"
Write-ColorOutput "Blue" "═════════════════════════════════════════════════════════════"
Write-Host ""

# Check if Vercel CLI is installed
$vercelCheck = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCheck) {
    Write-ColorOutput "Red" "✗ Vercel CLI not found"
    Write-Host "Install it with: npm install -g vercel"
    exit 1
}

Write-ColorOutput "Green" "✓ Vercel CLI detected"
Write-Host ""

Write-ColorOutput "Yellow" "CLIENT-SIDE VARIABLES (NEXT_PUBLIC_)"
Write-ColorOutput "Yellow" "These are exposed to the browser and are public"
Write-Host ""

$clientVars = @(
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

foreach ($var in $clientVars) {
    Write-Host "  $var"
}

Write-Host ""
Write-ColorOutput "Yellow" "SERVER-SIDE VARIABLES (SENSITIVE - Private)"
Write-ColorOutput "Yellow" "These should NEVER be exposed to the browser"
Write-Host ""

$serverVars = @(
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

foreach ($var in $serverVars) {
    Write-Host "  $var"
}

Write-ColorOutput "Blue" "`n═════════════════════════════════════════════════════════════`n"

# Option to export to file
$response = Read-Host "Export environment variable names to .env.example? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    $envContent = @"
# Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# Client-Side Variables (NEXT_PUBLIC_)
"@
    
    foreach ($var in $clientVars) {
        $envContent += "`n$var="
    }
    
    $envContent += "`n`n# Server-Side Variables (Sensitive)`n"
    
    foreach ($var in $serverVars) {
        $envContent += "`n$var="
    }
    
    Set-Content -Path ".env.example" -Value $envContent
    Write-ColorOutput "Green" "✓ Exported to .env.example"
}

Write-ColorOutput "Blue" "`nMANUAL SETUP INSTRUCTIONS:"
Write-Host "1. Go to: https://vercel.com/dashboard"
Write-Host "2. Select your 'sallify_portfolio' project"
Write-Host "3. Settings → Environment Variables"
Write-Host "4. Add each variable from the lists above with their values"
Write-Host "5. Redeploy the project"

Write-ColorOutput "Blue" "`nOR use Vercel CLI:"
Write-ColorOutput "Yellow" "  vercel env pull  # (pulls environment from Vercel)"
Write-ColorOutput "Yellow" "  vercel deploy   # (deploys with environment variables)"

Write-ColorOutput "Blue" "`n═════════════════════════════════════════════════════════════`n"

# Summary
Write-Host "Summary:"
Write-ColorOutput "Green" "✓ Total Variables: $($clientVars.Count + $serverVars.Count)"
Write-ColorOutput "Green" "✓ Client-Side: $($clientVars.Count)"
Write-ColorOutput "Green" "✓ Server-Side: $($serverVars.Count)"
