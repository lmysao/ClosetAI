# Script para alternar entre schema SQLite local e Supabase PostgreSQL (Windows PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("supabase", "local")]
    [string]$Mode
)

if ($Mode -eq "supabase") {
    Copy-Item "supabase/schema.prisma" "prisma/schema.prisma" -Force
    Write-Host "✅ Schema do Supabase ativado (PostgreSQL)" -ForegroundColor Green
    Write-Host "⚠️  Configure SUPABASE_DATABASE_URL no .env" -ForegroundColor Yellow
} elseif ($Mode -eq "local") {
    if (Test-Path "prisma/schema.prisma.backup") {
        Copy-Item "prisma/schema.prisma.backup" "prisma/schema.prisma" -Force
        Write-Host "✅ Schema local ativado (SQLite)" -ForegroundColor Green
        Write-Host "⚠️  Configure DATABASE_URL no .env" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Backup do schema local não encontrado" -ForegroundColor Red
        Write-Host "   Execute: Copy-Item prisma/schema.prisma prisma/schema.prisma.backup" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Uso: .\scripts\switch-db.ps1 -Mode [supabase|local]" -ForegroundColor Cyan
