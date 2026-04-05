@echo off
echo 🚀 SOLUCIÓN DEFINITIVA - CACHE Y REINICIO
echo ==============================================

cd /d "D:\CascadeProjects\windsurf-project\seacorp-evaluacion"

echo 📁 Carpeta actual: %CD%
echo.

echo 🗑️ Eliminando cache compilada...
if exist .next (
    rmdir /s /q .next
    echo ✅ Cache .next eliminada
) else (
    echo ℹ️ Cache .next no existe
)

echo 📋 Verificando .env.local...
if exist .env.local (
    echo ✅ .env.local existe
) else (
    echo ❌ .env.local NO existe - CREANDO...
    echo NEXT_PUBLIC_SUPABASE_URL=https://hruwezjiievzwopxtzal.supabase.co > .env.local
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydXdlemppaWV2endvcHh0emFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzE2OTQsImV4cCI6MjA5MDQ0NzY5NH0.mkEMNyZDb6oAKrl9Wf86qUtO2hEakxJ8jR8uaQsfp6o >> .env.local
    echo ✅ .env.local creado
)

echo.
echo 🔄 Iniciando servidor limpio...
echo 🌐 Abre: http://localhost:3000/dashboard
echo 🧹 Limpia cache del navegador: Ctrl+F5
echo.

npm run dev

pause
