// auth.js - Authentication Logic
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { appState, openAuthModal, showToast } from './app.js';

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        appState.currentUser = user;
        updateUIForLoggedIn();
        
        // Fetch user profile data
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                appState.userFollowing = userData.following || [];
            }
        } catch (error) {
            console.log('Error fetching user data:', error);
        }
    } else {
        appState.currentUser = null;
        updateUIForLoggedOut();
    }
});

function updateUIForLoggedIn() {
    const authBtn = document.getElementById('authBtn');
    const userName = appState.currentUser.displayName || appState.currentUser.email;
    
    authBtn.textContent = `${userName}`;
    authBtn.style.background = 'linear-gradient(135deg, #fe2c55, #00f7ef)';
    authBtn.style.cursor = 'pointer';
    
    authBtn.removeEventListener('click', openAuthModal);
    authBtn.addEventListener('click', handleLogout);
}

function updateUIForLoggedOut() {
    const authBtn = document.getElementById('authBtn');
    authBtn.textContent = 'Login';
    authBtn.style.background = 'var(--primary-color)';
    
    authBtn.removeEventListener('click', handleLogout);
    authBtn.addEventListener('click', openAuthModal);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        closeAuthModal();
        document.getElementById('loginForm').reset();
        showToast('Login successful!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message, 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const password2 = document.getElementById('signupPassword2').value;
    
    if (password !== password2) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with display name
        await updateProfile(user, {
            displayName: username
        });
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email,
            displayName: username,
            followers: 0,
            following: [],
            bio: '',
            profileImage: '',
            createdAt: new Date(),
            bookmarkedVideos: [],
            likedVideos: []
        });
        
        closeAuthModal();
        document.getElementById('signupForm').reset();
        showToast('Account created successfully!', 'success');
    } catch (error) {
        console.error('Signup error:', error);
        showToast(error.message, 'error');
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        signOut(auth).then(() => {
            showToast('Logged out successfully', 'success');
        }).catch((error) => {
            console.error('Logout error:', error);
            showToast('Error logging out', 'error');
        });
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('show');
}

// Export functions
export { handleLogin, handleSignup, handleLogout };
