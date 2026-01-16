// videos.js - Video Management Logic
import { db, storage } from './firebase-config.js';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Access appState and showToast from window (set in app.js)

async function handleUploadVideo(e) {
    e.preventDefault();
    
    if (!window.appState.currentUser) {
        window.showToast('Please login to upload videos', 'error');
        return;
    }
    
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const tags = document.getElementById('videoTags').value.split(',').map(t => t.trim());
    const videoFile = document.getElementById('videoFile').files[0];
    const thumbnailFile = document.getElementById('videoThumbnail').files[0];
    
    if (!videoFile) {
        showToast('Please select a video file', 'error');
        return;
    }
    
    try {
        // Show uploading state
        const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        
        // Upload video file
        const videoRef = ref(storage, `videos/${appState.currentUser.uid}/${Date.now()}`);
        const videoSnapshot = await uploadBytes(videoRef, videoFile);
        const videoUrl = await getDownloadURL(videoSnapshot.ref);
        
        // Upload thumbnail if provided
        let thumbnailUrl = 'https://via.placeholder.com/300x500?text=' + encodeURIComponent(title);
        if (thumbnailFile) {
            const thumbRef = ref(storage, `thumbnails/${window.appState.currentUser.uid}/${Date.now()}`);
            const thumbSnapshot = await uploadBytes(thumbRef, thumbnailFile);
            thumbnailUrl = await getDownloadURL(thumbSnapshot.ref);
        }
        
        // Add video document to Firestore
        const videoDoc = await addDoc(collection(db, 'videos'), {
            title: title,
            description: description,
            tags: tags,
            author: window.appState.currentUser.displayName || 'Anonymous',
            authorId: window.appState.currentUser.uid,
            videoUrl: videoUrl,
            thumbnailUrl: thumbnailUrl,
            duration: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
            createdAt: new Date(),
            category: tags[0] || 'general',
            likedBy: [],
            bookmarkedBy: [],
            commentCount: 0
        });
        
        // Add to local app state
        window.appState.videos.unshift({
            id: videoDoc.id,
            title: title,
            description: description,
            author: window.appState.currentUser.displayName || 'Anonymous',
            authorId: window.appState.currentUser.uid,
            url: videoUrl,
            thumbnail: thumbnailUrl,
            duration: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            category: tags[0] || 'general',
            timestamp: new Date(),
            liked: false,
            bookmarked: false
        });
        
        // Reset form
        document.getElementById('uploadForm').reset();
        document.getElementById('videoPreview').style.display = 'none';
        document.getElementById('thumbnailPreview').style.display = 'none';
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Reel';
        
        document.getElementById('uploadModal').classList.remove('show');
        window.showToast('Video uploaded successfully! 🎉', 'success');
        
    } catch (error) {
        console.error('Upload error:', error);
        window.showToast('Error uploading video: ' + error.message, 'error');
        
        const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Reel';
    }
}

async function loadAllVideos() {
    try {
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, orderBy('createdAt', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);
        
        const videos = [];
        querySnapshot.forEach((doc) => {
            videos.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return videos;
    } catch (error) {
        console.error('Error loading videos:', error);
        return [];
    }
}

async function likeVideo(videoId) {
    if (!window.appState.currentUser) {
        window.showToast('Please login to like videos', 'error');
        return;
    }
    
    try {
        const videoRef = doc(db, 'videos', videoId);
        const videoDoc = await getDoc(videoRef);
        
        if (videoDoc.exists()) {
            const data = videoDoc.data();
            const likedBy = data.likedBy || [];
            const userId = window.appState.currentUser.uid;
            
            if (likedBy.includes(userId)) {
                // Unlike
                await updateDoc(videoRef, {
                    likes: (data.likes || 0) - 1,
                    likedBy: likedBy.filter(id => id !== userId)
                });
            } else {
                // Like
                await updateDoc(videoRef, {
                    likes: (data.likes || 0) + 1,
                    likedBy: [...likedBy, userId]
                });
            }
        }
    } catch (error) {
        console.error('Error liking video:', error);
        window.showToast('Error updating like', 'error');
    }
}

async function bookmarkVideo(videoId) {
    if (!window.appState.currentUser) {
        window.showToast('Please login to bookmark videos', 'error');
        return;
    }
    
    try {
        const videoRef = doc(db, 'videos', videoId);
        const videoDoc = await getDoc(videoRef);
        
        if (videoDoc.exists()) {
            const data = videoDoc.data();
            const bookmarkedBy = data.bookmarkedBy || [];
            const userId = window.appState.currentUser.uid;
            
            if (bookmarkedBy.includes(userId)) {
                // Remove bookmark
                await updateDoc(videoRef, {
                    bookmarkedBy: bookmarkedBy.filter(id => id !== userId)
                });
            } else {
                // Add bookmark
                await updateDoc(videoRef, {
                    bookmarkedBy: [...bookmarkedBy, userId]
                });
            }
        }
    } catch (error) {
        console.error('Error bookmarking video:', error);
        window.showToast('Error updating bookmark', 'error');
    }
}

async function deleteVideo(videoId) {
    if (!window.appState.currentUser) {
        window.showToast('Please login', 'error');
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'videos', videoId));
        window.appState.videos = window.appState.videos.filter(v => v.id !== videoId);
        window.showToast('Video deleted', 'success');
    } catch (error) {
        console.error('Error deleting video:', error);
        window.showToast('Error deleting video', 'error');
    }
}

async function addComment(videoId, commentText) {
    if (!window.appState.currentUser) {
        window.showToast('Please login to comment', 'error');
        return;
    }
    
    if (!commentText.trim()) {
        window.showToast('Comment cannot be empty', 'error');
        return;
    }
    
    try {
        const commentsRef = collection(db, 'videos', videoId, 'comments');
        await addDoc(commentsRef, {
            author: window.appState.currentUser.displayName || 'Anonymous',
            authorId: window.appState.currentUser.uid,
            text: commentText,
            createdAt: new Date(),
            likes: 0
        });
        
        // Update comment count
        const videoRef = doc(db, 'videos', videoId);
        const videoDoc = await getDoc(videoRef);
        if (videoDoc.exists()) {
            await updateDoc(videoRef, {
                commentCount: (videoDoc.data().commentCount || 0) + 1
            });
        }
        
        showToast('Comment added!', 'success');
        return true;
    } catch (error) {
        console.error('Error adding comment:', error);
        window.showToast('Error adding comment', 'error');
        return false;
    }
}

async function getComments(videoId) {
    try {
        const commentsRef = collection(db, 'videos', videoId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const comments = [];
        querySnapshot.forEach((doc) => {
            comments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return comments;
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

async function followUser(userId) {
    if (!window.appState.currentUser) {
        window.showToast('Please login to follow users', 'error');
        return;
    }
    
    try {
        const userRef = doc(db, 'users', window.appState.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const following = userDoc.data().following || [];
            
            if (!following.includes(userId)) {
                following.push(userId);
                await updateDoc(userRef, {
                    following: following
                });
                
                window.appState.userFollowing = following;
                window.showToast('Following!', 'success');
            }
        }
    } catch (error) {
        console.error('Error following user:', error);
        window.showToast('Error following user', 'error');
    }
}
async function unfollowUser(userId) {
    if (!window.appState.currentUser) {
        return;
    }
    
    try {
        const userRef = doc(db, 'users', window.appState.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const following = userDoc.data().following || [];
            const filtered = following.filter(id => id !== userId);
            
            await updateDoc(userRef, {
                following: filtered
            });
            
            window.appState.userFollowing = filtered;
            window.showToast('Unfollowed', 'success');
        }
    } catch (error) {
        console.error('Error unfollowing user:', error);
        window.showToast('Error unfollowing user', 'error');
    }
}

// Export functions
export {
    handleUploadVideo,
    loadAllVideos,
    likeVideo,
    bookmarkVideo,
    deleteVideo,
    addComment,
    getComments,
    followUser,
    unfollowUser
};
