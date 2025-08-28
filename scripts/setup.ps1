# Setup script for Prisma with SSL bypass
# Run this script before running Prisma commands

Write-Host "Setting up environment variables for Prisma..." -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "file:./dev.db"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host "NODE_TLS_REJECT_UNAUTHORIZED: $env:NODE_TLS_REJECT_UNAUTHORIZED" -ForegroundColor Cyan

Write-Host "`nYou can now run Prisma commands:" -ForegroundColor Green
Write-Host "  npx prisma generate" -ForegroundColor White
Write-Host "  npx prisma db push" -ForegroundColor White
Write-Host "  npm run db:seed" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White 