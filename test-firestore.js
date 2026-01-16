// Firebase Firestore Connection Test
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCfT1UFmoGSAanbIDTLYGeFfPE7uCa74Fw",
    authDomain: "nexchat-47326.firebaseapp.com",
    projectId: "nexchat-47326",
    storageBucket: "nexchat-47326.appspot.com",
    messagingSenderId: "327330605104",
    appId: "1:327330605104:web:ac43bb9adf7e4f1f1065f5"
};

console.log("🔧 Starting Firestore API Test...\n");
console.log("📋 Firebase Config:");
console.log(`   Project ID: ${firebaseConfig.projectId}`);
console.log(`   Auth Domain: ${firebaseConfig.authDomain}\n`);

try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log("✅ Firebase initialized successfully\n");
    
    // Test 1: Connect to Firestore
    console.log("Test 1: Checking Firestore Connection...");
    
    // Try to read from videos collection
    const videosRef = collection(db, 'videos');
    const videoDocs = await getDocs(videosRef);
    
    console.log(`✅ Connected to Firestore`);
    console.log(`   Videos in database: ${videoDocs.size}\n`);
    
    // Test 2: Check users collection
    console.log("Test 2: Checking Users Collection...");
    const usersRef = collection(db, 'users');
    const userDocs = await getDocs(usersRef);
    
    console.log(`✅ Users collection accessible`);
    console.log(`   Total users: ${userDocs.size}\n`);
    
    if (userDocs.size > 0) {
        console.log("📝 Sample Users:");
        userDocs.docs.slice(0, 5).forEach((doc, i) => {
            const data = doc.data();
            console.log(`   ${i + 1}. ${data.displayName || data.email || 'Unknown'}`);
        });
    } else {
        console.log("⚠️  No users in database yet\n");
    }
    
    // Test 3: Overall Status
    console.log("\n" + "=".repeat(50));
    console.log("📊 FIRESTORE API STATUS");
    console.log("=".repeat(50));
    console.log("✅ Connection: WORKING");
    console.log("✅ Database Access: ENABLED");
    console.log("✅ Videos Collection: " + (videoDocs.size > 0 ? "AVAILABLE" : "EMPTY"));
    console.log("✅ Users Collection: " + (userDocs.size > 0 ? `ACTIVE (${userDocs.size} users)` : "EMPTY"));
    console.log("\n✨ Your Firestore API is fully operational!");
    console.log("🎬 NEX-REELS is ready for video uploads and user search\n");

} catch (error) {
    console.error("❌ FIRESTORE ERROR:");
    console.error(`   Error Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error("\n⚠️  Possible causes:");
    console.error("   1. Firestore API not enabled");
    console.error("   2. Database not created");
    console.error("   3. Security rules blocking access");
    console.error("   4. Network connection issue");
}
