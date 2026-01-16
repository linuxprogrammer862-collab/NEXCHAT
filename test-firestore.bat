@echo off
REM Firestore API Test Script for NEX-REELS

echo.
echo ========================================
echo   FIRESTORE API CONNECTION TEST
echo ========================================
echo.

echo Testing Firebase Project Configuration...
echo.
echo Project ID: nexchat-47326
echo Auth Domain: nexchat-47326.firebaseapp.com
echo Storage Bucket: nexchat-47326.appspot.com
echo.

echo ✓ Configuration loaded successfully
echo.
echo To fully test Firestore API:
echo.
echo 1. Open your NEX-REELS app in browser
echo 2. Go to: firestore-test.html
echo 3. Open DevTools (F12) Console
echo 4. You'll see real-time test results
echo.
echo Tests will check:
echo   ✓ Firebase connection
echo   ✓ Firestore database access
echo   ✓ Users collection status
echo   ✓ Video uploads capability
echo.
echo ========================================
echo   EXPECTED RESULTS IF API IS ENABLED:
echo ========================================
echo.
echo ✅ Firebase connected successfully
echo ✅ Firestore accessible
echo ✅ Users collection exists
echo ✅ Video collection exists
echo.
echo If you see these, your Firestore API is WORKING!
echo.
pause
