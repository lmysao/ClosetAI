#!/bin/bash

# Script para alternar entre schema SQLite local e Supabase PostgreSQL

if [ "$1" = "supabase" ]; then
  cp supabase/schema.prisma prisma/schema.prisma
  echo "✅ Schema do Supabase ativado (PostgreSQL)"
  echo "⚠️  Configure SUPABASE_DATABASE_URL no .env"
elif [ "$1" = "local" ]; then
  if [ -f "prisma/schema.prisma.backup" ]; then
    cp prisma/schema.prisma.backup prisma/schema.prisma
    echo "✅ Schema local ativado (SQLite)"
    echo "⚠️  Configure DATABASE_URL no .env"
  else
    echo "❌ Backup do schema local não encontrado"
    echo "   Execute: cp prisma/schema.prisma prisma/schema.prisma.backup"
  fi
else
  echo "Uso: ./scripts/switch-db.sh [supabase|local]"
  echo ""
  echo "  supabase - Ativa schema PostgreSQL para Supabase"
  echo "  local    - Ativa schema SQLite para desenvolvimento local"
fi
