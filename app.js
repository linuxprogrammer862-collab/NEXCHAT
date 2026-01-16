// app.js - Main Application Logic
import { auth, db, storage } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import './auth.js';
import './videos.js';
import './ui.js';
import './interactions.js';

const isAndroid = /Android/.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const isMobile = isAndroid || isIOS;

// Fix for Android keyboard issues
if (isAndroid) {
    console.log('🤖 Android detected - applying fixes');
    // Prevent default Android behaviors
    document.addEventListener('touchmove', function(e) {
        if (e.target.closest('input, textarea, select')) return; // Allow scrolling in form inputs
    }, { passive: true });
    
    // Fix viewport height on Android
    function setAndroidHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setAndroidHeight();
    window.addEventListener('orientationchange', setAndroidHeight);
    window.addEventListener('resize', setAndroidHeight);
}

// Global state
const appState = {
    currentUser: null,
    currentPage: 'home',
    videos: [],
    followingVideos: [],
    userFollowing: [],
    bookmarkedVideos: [],
    notifications: [],
    conversations: [],
    currentConversation: null,
    currentVideoId: null,
    isPlayerOpen: false
};

// Expose appState globally for other modules
window.appState = appState;
window.isAndroid = isAndroid;
window.isMobile = isMobile;

function initializeApp() {
    setupEventListeners();
    checkAuthState();
    loadVideos();
}

function checkAuthState() {

function showLoadingSpinner(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner"></i><p>Loading...</p></div>';
    }
}

function clearContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            if (page) {
                navigateToPage(page);
                updateBottomNavActive(btn);
            }
        });
    });

    // Upload button (mobile)
    document.getElementById('uploadBtnMobile').addEventListener('click', openUploadModal);

    // Search
    document.getElementById('searchBtn').addEventListener('click', searchVideos);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchVideos();
    });

    // Modal closes
    setupModalCloses();

    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchAuthTab(button.dataset.tab));
    });

    document.querySelectorAll('.switch-tab').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthTab(link.dataset.tab);
        });
    });

    // Upload form
    document.getElementById('uploadForm').addEventListener('submit', handleUploadVideo);
    document.getElementById('videoFile').addEventListener('change', previewVideo);
    document.getElementById('videoThumbnail').addEventListener('change', previewThumbnail);

    // Report form
    document.getElementById('reportForm').addEventListener('submit', handleReport);

    // Explore filters
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => filterByCategory(tag.dataset.category));
    });
}

function setupModalCloses() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });
}

function navigateToPage(page) {
    appState.currentPage = page;
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    const pageElement = document.getElementById(page + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
        
        // Load page-specific content
        switch(page) {
            case 'home':
                loadHomeVideos();
                break;
            case 'following':
                loadFollowingVideos();
                break;
            case 'explore':
                loadExploreVideos();
                break;
            case 'bookmarks':
                loadBookmarks();
                break;
            case 'stats':
                loadStats();
                break;
            case 'notifications':
                loadNotifications();
                break;
            case 'messages':
                loadMessages();
                break;
            case 'profile':
                loadProfile();
                break;
        }
    }
}

function updateBottomNavActive(btn) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// Modal functions
function openAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('show');
}

function openUploadModal() {
    if (!appState.currentUser) {
        showToast('Please login first', 'error');
        openAuthModal();
        return;
    }
    const modal = document.getElementById('uploadModal');
    modal.classList.add('show');
}

function openCommentModal(videoId) {
    appState.currentVideoId = videoId;
    const modal = document.getElementById('commentModal');
    modal.classList.add('show');
    loadComments(videoId);
}

function openReportModal(video) {
    appState.currentVideoId = video.id;
    appState.currentVideoData = video;
    const modal = document.getElementById('reportModal');
    modal.classList.add('show');
    
    // Reset form
    document.getElementById('reportForm').reset();
    document.getElementById('reportSuccessMessage').style.display = 'none';
    document.getElementById('reportForm').style.display = 'block';
}

function closeModal(modal) {
    modal.classList.remove('show');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tab).classList.add('active');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}

function loadVideos() {
        {
            id: '1',
            title: 'Amazing Dance Moves',
            description: 'Check out these incredible dance moves!',
            author: 'DancerJohn',
            authorId: 'user1',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnail: 'https://via.placeholder.com/300x500?text=Dance',
            duration: 45,
            likes: 2345,
            comments: 567,
            shares: 234,
            category: 'dance',
            timestamp: new Date(),
            liked: false,
            bookmarked: false
        },
        {
            id: '2',
            title: 'Comedy Skit',
            description: 'Funny moments',
            author: 'ComedyKing',
            authorId: 'user2',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnail: 'https://via.placeholder.com/300x500?text=Comedy',
            duration: 60,
            likes: 3456,
            comments: 890,
            shares: 345,
            category: 'comedy',
            timestamp: new Date(),
            liked: false,
            bookmarked: false
        },
        {
            id: '3',
            title: 'Music Production',
            description: 'Behind the scenes of music making',
            author: 'ProducerMike',
            authorId: 'user3',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnail: 'https://via.placeholder.com/300x500?text=Music',
            duration: 90,
            likes: 4567,
            comments: 1234,
            shares: 567,
            category: 'music',
            timestamp: new Date(),
            liked: false,
            bookmarked: false
        }
    ];
}

function loadHomeVideos() {
    showLoadingSpinner('videoFeed');
        clearContainer('videoFeed');
        const feed = document.getElementById('videoFeed');
        
        if (appState.videos.length === 0) {
            feed.innerHTML = '<div class="empty-state"><i class="fas fa-video"></i><p>No videos available. Start creating!</p></div>';
            return;
        }
        
        appState.videos.forEach(video => {
            const card = createVideoCard(video);
            feed.appendChild(card);
        });
    }, 500);
}

function loadFollowingVideos() {
    showLoadingSpinner('followingFeed');
    
    setTimeout(() => {
        clearContainer('followingFeed');
        const feed = document.getElementById('followingFeed');
        
        if (!appState.currentUser) {
            feed.innerHTML = '<div class="empty-state"><i class="fas fa-heart"></i><p>Login to see videos from people you follow</p></div>';
            return;
        }
        
        // Filter videos from following users
        const followingVids = appState.videos.filter(v => appState.userFollowing.includes(v.authorId));
        
        if (followingVids.length === 0) {
            feed.innerHTML = '<div class="empty-state"><i class="fas fa-user-friends"></i><p>Start following creators to see their videos</p></div>';
            return;
        }
        
        followingVids.forEach(video => {
            feed.appendChild(createVideoCard(video));
        });
    }, 500);
}

function loadExploreVideos() {
    showLoadingSpinner('exploreGrid');
    
    setTimeout(() => {
        clearContainer('exploreGrid');
        const grid = document.getElementById('exploreGrid');
        
        if (appState.videos.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No videos to explore yet</p></div>';
            return;
        }
        
        appState.videos.forEach(video => {
            grid.appendChild(createVideoCard(video));
        });
    }, 500);
}

function loadBookmarks() {
    const list = document.getElementById('bookmarksList');
    list.innerHTML = '';
    
    if (!appState.currentUser) {
        list.innerHTML = '<p class="empty-state">Login to save bookmarks</p>';
        return;
    }
    
    const bookmarked = appState.videos.filter(v => v.bookmarked);
    
    if (bookmarked.length === 0) {
        list.innerHTML = '<p class="empty-state"><i class="fas fa-bookmark"></i><p>No bookmarked videos yet</p></p>';
        return;
    }
    
    bookmarked.forEach(video => {
        list.appendChild(createVideoCard(video));
    });
}

function loadStats() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const videosThisWeek = appState.videos.filter(v => {
        const vidDate = v.timestamp instanceof Date ? v.timestamp : new Date(v.timestamp);
        return vidDate > weekAgo;
    });
    
    const creators = new Set(appState.videos.map(v => v.authorId)).size;
    const totalLikes = appState.videos.reduce((sum, v) => sum + (v.likes || 0), 0);
    
    document.getElementById('totalVideosStat').textContent = appState.videos.length;
    document.getElementById('videosThisWeekStat').textContent = videosThisWeek.length;
    document.getElementById('activeCreatorsStat').textContent = creators;
    document.getElementById('totalLikesStat').textContent = totalLikes.toLocaleString();
    
    const recentList = document.getElementById('recentUploadsList');
    recentList.innerHTML = '';
    
    const recentVideos = [...appState.videos].sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return timeB - timeA;
    }).slice(0, 10);
    
    if (recentVideos.length === 0) {
        recentList.innerHTML = '<p class="empty-state">No videos yet</p>';
        return;
    }
    
    recentVideos.forEach(video => {
        const timeAgo = formatTime(video.timestamp instanceof Date ? video.timestamp : new Date(video.timestamp));
        const item = document.createElement('div');
        item.className = 'upload-item';
        item.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}" class="upload-thumbnail">
            <div class="upload-info">
                <div class="upload-title">${video.title}</div>
                <div class="upload-meta">by @${video.author}</div>
                <div class="upload-stats">
                    <span>❤️ ${(video.likes || 0).toLocaleString()}</span>
                    <span>💬 ${(video.comments || 0).toLocaleString()}</span>
                    <span>👁️ ${(video.views || 0).toLocaleString()}</span>
                    <span>${timeAgo}</span>
                </div>
            </div>
        `;
        recentList.appendChild(item);
    });
}

function loadNotifications() {
    const list = document.getElementById('notificationsList');
    list.innerHTML = '';
    
    if (!appState.currentUser) {
        list.innerHTML = '<p class="empty-state">Login to see notifications</p>';
        return;
    }
    
    if (appState.notifications.length === 0) {
        list.innerHTML = '<p class="empty-state">No new notifications</p>';
        return;
    }
    
    appState.notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.innerHTML = `
            <div class="notification-avatar">${notif.avatar}</div>
            <div class="notification-content">
                <p><strong>${notif.user}</strong> ${notif.message}</p>
                <p class="notification-time">${formatTime(notif.timestamp)}</p>
            </div>
        `;
        list.appendChild(item);
    });
}

function loadMessages() {
    const list = document.getElementById('conversationsList');
    list.innerHTML = '';
    
    if (!appState.currentUser) {
        list.innerHTML = '<p class="empty-state">Login to see messages</p>';
        return;
    }
    
    if (appState.conversations.length === 0) {
        list.innerHTML = '<p class="empty-state">No conversations yet</p>';
        return;
    }
    
    appState.conversations.forEach((conv, index) => {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        if (appState.currentConversation === index) item.classList.add('active');
        item.innerHTML = `
            <div class="conversation-avatar">${conv.avatar}</div>
            <div class="conversation-info">
                <div class="conversation-name">${conv.name}</div>
                <div class="conversation-preview">${conv.lastMessage}</div>
            </div>
        `;
        item.addEventListener('click', () => loadConversation(index));
        list.appendChild(item);
    });
}

function loadConversation(index) {
    appState.currentConversation = index;
    const conversation = appState.conversations[index];
    const chatArea = document.getElementById('chatArea');
    const messages = document.getElementById('chatMessages');
    
    document.querySelectorAll('.conversation-item').forEach((item, i) => {
        if (i === index) item.classList.add('active');
        else item.classList.remove('active');
    });
    
    chatArea.style.display = 'flex';
    messages.innerHTML = '';
    
    conversation.messages.forEach(msg => {
        const msgEl = document.createElement('div');
        msgEl.className = `message ${msg.sent ? 'sent' : 'received'}`;
        msgEl.textContent = msg.text;
        messages.appendChild(msgEl);
    });
    
    messages.scrollTop = messages.scrollHeight;
}

function loadProfile() {
    const content = document.getElementById('profileContent');
    const placeholder = document.getElementById('profilePlaceholder');
    
    if (!appState.currentUser) {
        content.style.display = 'none';
        placeholder.style.display = 'block';
        return;
    }
    
    placeholder.style.display = 'none';
    content.style.display = 'block';
    
    const userVideos = appState.videos.filter(v => v.authorId === appState.currentUser.uid);
    
    content.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">${appState.currentUser.displayName?.charAt(0) || 'U'}</div>
            <div class="profile-name">${appState.currentUser.displayName || 'User'}</div>
            <div class="profile-username">@${appState.currentUser.email?.split('@')[0]}</div>
            <div class="profile-bio">Welcome to NEX-REELS!</div>
            
            <div class="profile-stats">
                <div class="profile-stat">
                    <div class="profile-stat-number">${userVideos.length}</div>
                    <div class="profile-stat-label">Videos</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-number">${userVideos.reduce((sum, v) => sum + v.likes, 0)}</div>
                    <div class="profile-stat-label">Likes</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-number">${appState.userFollowing.length}</div>
                    <div class="profile-stat-label">Following</div>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="btn-secondary" id="editProfileBtn">Edit Profile</button>
                <button class="btn-secondary" id="logoutBtn">Logout</button>
            </div>
        </div>
        
        <div class="profile-tabs">
            <button class="profile-tab active" data-tab="videos">Videos</button>
            <button class="profile-tab" data-tab="likes">Likes</button>
        </div>
        
        <div class="profile-videos" id="profileVideos">
            ${userVideos.length === 0 ? '<p class="empty-state">No videos yet. <a href="#" onclick="openUploadModal(); return false;">Upload your first video!</a></p>' : ''}
        </div>
    `;
    
    userVideos.forEach(video => {
        document.getElementById('profileVideos').appendChild(createVideoCard(video));
    });
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('editProfileBtn').addEventListener('click', () => {
        showToast('Profile editing coming soon!', 'error');
    });
    
    // Profile tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'likes') {
                const likedVideos = appState.videos.filter(v => v.liked);
                document.getElementById('profileVideos').innerHTML = likedVideos.length === 0 ? '<p class="empty-state">No liked videos</p>' : '';
                likedVideos.forEach(video => {
                    document.getElementById('profileVideos').appendChild(createVideoCard(video));
                });
            } else {
                document.getElementById('profileVideos').innerHTML = '';
                userVideos.forEach(video => {
                    document.getElementById('profileVideos').appendChild(createVideoCard(video));
                });
            }
        });
    });
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
        <img src="${video.thumbnail}" alt="${video.title}" class="video-card-thumbnail">
        <div class="video-card-overlay">
            <div class="video-card-info">
                <div class="video-card-title">${video.title}</div>
                <div class="video-card-author">@${video.author}</div>
            </div>
        </div>
        <i class="fas fa-play-circle video-play-icon"></i>
    `;
    
    card.addEventListener('click', () => openVideoPlayer(video));
    return card;
}

function openVideoPlayer(video) {
    appState.currentVideoId = video.id;
    appState.isPlayerOpen = true;
    
    const player = document.createElement('div');
    player.className = 'video-player';
    player.id = 'videoPlayer';
    player.innerHTML = `
        <div class="player-container">
            <button class="player-close"><i class="fas fa-times"></i></button>
            <video class="player-video" controls>
                <source src="${video.url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            
            <div class="player-right-controls">
                <div>
                    <button class="control-button like-btn" id="likeBtn">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="control-count">${video.likes}</div>
                </div>
                
                <div>
                    <button class="control-button comment-btn" id="commentBtn">
                        <i class="fas fa-comment"></i>
                    </button>
                    <div class="control-count">${video.comments}</div>
                </div>
                
                <div>
                    <button class="control-button share-btn" id="shareBtn">
                        <i class="fas fa-share"></i>
                    </button>
                    <div class="control-count">${video.shares}</div>
                </div>
                
                <div>
                    <button class="control-button bookmark-btn" id="bookmarkBtn">
                        <i class="fas ${video.bookmarked ? 'fas-solid' : 'far'} fa-bookmark"></i>
                    </button>
                </div>

                <div>
                    <button class="control-button report-btn" id="reportBtn">
                        <i class="fas fa-flag"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(player);
    
    // Player controls
    const closeBtn = player.querySelector('.player-close');
    closeBtn.addEventListener('click', closeVideoPlayer);
    
    const likeBtn = player.querySelector('#likeBtn');
    likeBtn.addEventListener('click', () => toggleLike(video));
    
    const commentBtn = player.querySelector('#commentBtn');
    commentBtn.addEventListener('click', () => {
        closeVideoPlayer();
        openCommentModal(video.id);
    });
    
    const shareBtn = player.querySelector('#shareBtn');
    shareBtn.addEventListener('click', () => shareVideo(video));
    
    const bookmarkBtn = player.querySelector('#bookmarkBtn');
    bookmarkBtn.addEventListener('click', () => toggleBookmark(video, bookmarkBtn));

    const reportBtn = player.querySelector('#reportBtn');
    reportBtn.addEventListener('click', () => {
        closeVideoPlayer();
        openReportModal(video);
    });
}

function closeVideoPlayer() {
    const player = document.getElementById('videoPlayer');
    if (player) {
        player.remove();
        appState.isPlayerOpen = false;
    }
}

function toggleLike(video) {
    if (!appState.currentUser) {
        showToast('Login to like videos', 'error');
        openAuthModal();
        return;
    }
    
    video.liked = !video.liked;
    video.likes += video.liked ? 1 : -1;
    
    const likeBtn = document.querySelector('#likeBtn');
    if (video.liked) {
        likeBtn.classList.add('active');
        showToast('Video liked!', 'success');
    } else {
        likeBtn.classList.remove('active');
        showToast('Like removed', 'success');
    }
    
    likeBtn.querySelector('.control-count').textContent = video.likes;
}

function toggleBookmark(video, btn) {
    if (!appState.currentUser) {
        showToast('Login to bookmark videos', 'error');
        openAuthModal();
        return;
    }
    
    video.bookmarked = !video.bookmarked;
    
    if (video.bookmarked) {
        btn.classList.add('active');
        showToast('Video bookmarked!', 'success');
    } else {
        btn.classList.remove('active');
        showToast('Bookmark removed', 'success');
    }
}

function shareVideo(video) {
    const shareUrl = `${window.location.origin}?video=${video.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: video.title,
            text: video.description,
            url: shareUrl
        }).catch(err => console.log('Share error:', err));
    } else {
        navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!', 'success');
    }
}

function loadComments(videoId) {
    const list = document.getElementById('commentsList');
    list.innerHTML = `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-avatar">J</div>
                <div class="comment-name">John User</div>
                <div class="comment-time">2 hours ago</div>
            </div>
            <div class="comment-text">Amazing video! Love the creativity!</div>
        </div>
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-avatar">S</div>
                <div class="comment-name">Sarah Creator</div>
                <div class="comment-time">1 hour ago</div>
            </div>
            <div class="comment-text">Thanks so much! 🎉</div>
        </div>
    `;
}

function previewVideo() {
    const file = document.getElementById('videoFile').files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const video = document.getElementById('videoPreview');
        video.src = url;
        video.style.display = 'block';
    }
}

function previewThumbnail() {
    const file = document.getElementById('videoThumbnail').files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const img = document.getElementById('thumbnailPreview');
        img.src = url;
        img.style.display = 'block';
    }
}

function filterByCategory(category) {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const grid = document.getElementById('exploreGrid');
    grid.innerHTML = '';
    
    let filtered = appState.videos;
    if (category !== 'all') {
        filtered = appState.videos.filter(v => v.category === category);
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-state">No videos in this category</p>';
        return;
    }
    
    filtered.forEach(video => {
        grid.appendChild(createVideoCard(video));
    });
}

function searchVideos() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if (!query) {
        loadHomeVideos();
        navigateToPage('home');
        return;
    }
    
    const results = appState.videos.filter(v =>
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        v.author.toLowerCase().includes(query)
    );
    
    const feed = document.getElementById('videoFeed');
    feed.innerHTML = '';
    
    if (results.length === 0) {
        feed.innerHTML = '<p class="empty-state"><i class="fas fa-search"></i><p>No videos found</p></p>';
        return;
    }
    
    results.forEach(video => {
        feed.appendChild(createVideoCard(video));
    });
    
    navigateToPage('home');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

async function handleReport(e) {
    e.preventDefault();

    if (!appState.currentVideoData) {
        showToast('No video selected', 'error');
        return;
    }

    try {
        const reason = document.getElementById('reportReason').value;
        const description = document.getElementById('reportDescription').value;
        const isAnonymous = document.getElementById('reportAnonymous').checked;

        if (!reason) {
            showToast('Please select a reason', 'error');
            return;
        }

        // Save report to Firestore
        await addDoc(collection(db, 'reports'), {
            videoId: appState.currentVideoData.id,
            videoTitle: appState.currentVideoData.title,
            authorId: appState.currentVideoData.authorId,
            author: appState.currentVideoData.author,
            reason: reason,
            description: description,
            reportedBy: isAnonymous ? 'Anonymous' : (appState.currentUser?.uid || 'Unknown'),
            reportedByEmail: isAnonymous ? null : (appState.currentUser?.email || null),
            isAnonymous: isAnonymous,
            status: 'pending',
            createdAt: new Date(),
            flagged: false,
            deleted: false
        });

        // Show success message
        document.getElementById('reportForm').style.display = 'none';
        document.getElementById('reportSuccessMessage').style.display = 'block';

        showToast('Report submitted successfully! Thank you.', 'success');

        // Close modal after 2 seconds
        setTimeout(() => {
            document.getElementById('reportModal').classList.remove('show');
        }, 2000);

    } catch (error) {
        console.error('Error submitting report:', error);
        showToast('Error submitting report: ' + error.message, 'error');
    }
}

// Exports for other modules
export { appState, openAuthModal, openUploadModal, openCommentModal, closeModal, showToast, navigateToPage };

// Also expose critical functions globally
window.showToast = showToast;
window.navigateToPage = navigateToPage;
window.openAuthModal = openAuthModal;
window.openUploadModal = openUploadModal;
window.openReportModal = openReportModal;
