@echo off
echo ========================================
echo   Pushing Sinar Tani to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Creating backup remote (optional)...
git remote remove origin 2>nul

echo.
echo Step 2: Adding GitHub remote...
git remote add origin https://github.com/KakaLovie/sinar-tani-mongo.git

echo.
echo Step 3: Pushing to GitHub...
echo IMPORTANT: If this fails, create the repository first at:
echo https://github.com/new
echo Repository name: sinar-tani-mongo
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Pushed to GitHub
    echo ========================================
    echo.
    echo Next step: Deploy to Vercel
    echo 1. Go to https://vercel.com
    echo 2. Import your GitHub repository
    echo 3. Add MongoDB Atlas connection string
    echo 4. Deploy!
) else (
    echo.
    echo ========================================
    echo   PUSH FAILED
    echo ========================================
    echo.
    echo Please create the repository first:
    echo 1. Go to https://github.com/new
    echo 2. Repository name: sinar-tani-mongo
    echo 3. Click Create repository
    echo 4. Run this script again
)

pause
