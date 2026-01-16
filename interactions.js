// interactions.js - User Interactions and Real-time Features
import { addComment } from './videos.js';

// Access appState and showToast from window (set in app.js)

// Initialize all interaction handlers
document.addEventListener('DOMContentLoaded', () => {
    setupInteractionHandlers();
});

function setupInteractionHandlers() {
    // Comment form submission
    const commentForm = document.getElementById('commentModal');
    if (commentForm) {
        setupCommentHandling();
    }
    
    // Message sending
    setupMessageHandling();
    
    // Video interactions
    setupVideoInteractions();
    
    // Follow/Unfollow
    setupFollowButtons();
}

function setupCommentHandling() {
    const commentInput = document.getElementById('commentInput');
    const submitBtn = document.getElementById('commentSubmitBtn');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const text = commentInput.value.trim();
            if (!text) {
                window.showToast('Comment cannot be empty', 'error');
                return;
            }
            
            const success = await addComment(window.appState.currentVideoId, text);
            if (success) {
                commentInput.value = '';
                // Reload comments
                loadCommentsList();
            }
        });
        
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitBtn.click();
            }
        });
    }
}

async function loadCommentsList() {
    if (!appState.currentVideoId) return;
    
    try {
        const comments = await getComments(appState.currentVideoId);
        const list = document.getElementById('commentsList');
        list.innerHTML = '';
        
        if (comments.length === 0) {
            list.innerHTML = '<p class="empty-state">No comments yet. Be the first!</p>';
            return;
        }
        
        comments.forEach(comment => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <div class="comment-header">
                    <div class="comment-avatar">${comment.author.charAt(0).toUpperCase()}</div>
                    <div class="comment-name">${comment.author}</div>
                    <div class="comment-time">${formatCommentTime(comment.createdAt)}</div>
                </div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
                ${appState.currentUser && appState.currentUser.uid === comment.authorId ? 
                    `<button class="btn-delete-comment" data-id="${comment.id}" style="font-size: 12px; color: var(--error-color);">Delete</button>` 
                    : ''}
            `;
            list.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function setupMessageHandling() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();
    
    if (!text) {
        showToast('Message cannot be empty', 'error');
        return;
    }
    
    if (!appState.currentConversation !== null) {
        showToast('No conversation selected', 'error');
        return;
    }
    
    // Add message to chat
    const chatMessages = document.getElementById('chatMessages');
    const msgEl = document.createElement('div');
    msgEl.className = 'message sent';
    msgEl.textContent = text;
    chatMessages.appendChild(msgEl);
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Here you would send the message to Firestore
    // await sendMessageToFirestore(appState.currentConversation, text);
}

function setupVideoInteractions() {
    // Heart button animation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn')) {
            const btn = e.target.closest('.like-btn');
            btn.classList.toggle('active');
            createHeartAnimation(e.pageX, e.pageY);
        }
    });
    
    // Double tap to like (mobile)
    let lastTapTime = 0;
    document.addEventListener('click', (e) => {
        const now = new Date().getTime();
        const tap = now - lastTapTime;
        
        if (tap < 300 && tap > 0) {
            const video = e.target.closest('.player-video');
            if (video) {
                createHeartAnimation(e.pageX, e.pageY);
                document.querySelector('.like-btn')?.click();
            }
        }
        lastTapTime = now;
    });
}

function createHeartAnimation(x, y) {
    const heart = document.createElement('div');
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    heart.style.position = 'fixed';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.color = 'var(--primary-color)';
    heart.style.fontSize = '48px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.animation = 'heartFloat 1s ease-out';
    
    // Add animation keyframes if not exists
    if (!document.querySelector('style[data-heart-animation]')) {
        const style = document.createElement('style');
        style.setAttribute('data-heart-animation', 'true');
        style.textContent = `
            @keyframes heartFloat {
                0% {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(0, -100px) scale(1.5);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(heart);
    
    setTimeout(() => heart.remove(), 1000);
}

function setupFollowButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.follow-btn')) {
            const btn = e.target.closest('.follow-btn');
            const userId = btn.dataset.userId;
            
            btn.disabled = true;
            
            if (btn.classList.contains('active')) {
                // Unfollow
                unfollowUser(userId);
                btn.classList.remove('active');
                btn.textContent = 'Follow';
            } else {
                // Follow
                followUser(userId);
                btn.classList.add('active');
                btn.textContent = 'Following';
            }
            
            btn.disabled = false;
        }
    });
}

async function followUser(userId) {
    if (!appState.currentUser) {
        showToast('Please login to follow users', 'error');
        return;
    }
    
    // Add user to following list
    if (!appState.userFollowing.includes(userId)) {
        appState.userFollowing.push(userId);
        showToast('Following!', 'success');
    }
}

async function unfollowUser(userId) {
    appState.userFollowing = appState.userFollowing.filter(id => id !== userId);
    showToast('Unfollowed', 'success');
}

// Utility functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatCommentTime(date) {
    if (typeof date === 'object' && date.toDate) {
        date = date.toDate();
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Real-time typing indicator
export function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    indicator.style.cssText = `
        display: flex;
        gap: 4px;
        margin: 10px 0;
    `;
    
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Animation
    const style = document.createElement('style');
    style.textContent = `
        .typing-indicator span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--text-secondary);
            animation: typing 1.4s infinite;
        }
        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }
        @keyframes typing {
            0%, 60%, 100% {
                opacity: 0.3;
                transform: translateY(0);
            }
            30% {
                opacity: 1;
                transform: translateY(-10px);
            }
        }
    `;
    document.head.appendChild(style);
}

export function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
}

// Add reaction emojis to videos
export function setupReactions() {
    const reactions = ['❤️', '😂', '😮', '😢', '🔥', '👏'];
    
    document.addEventListener('click', (e) => {
        if (e.target.closest('.reactions-btn')) {
            const btn = e.target.closest('.reactions-btn');
            const menu = createReactionMenu(reactions);
            
            // Position menu near button
            menu.style.position = 'absolute';
            menu.style.top = btn.offsetTop - 50 + 'px';
            menu.style.left = btn.offsetLeft + 'px';
            
            btn.parentElement.appendChild(menu);
            
            setTimeout(() => menu.remove(), 5000);
        }
    });
}

function createReactionMenu(reactions) {
    const menu = document.createElement('div');
    menu.className = 'reaction-menu';
    menu.innerHTML = reactions.map(emoji => 
        `<button class="reaction-emoji">${emoji}</button>`
    ).join('');
    
    menu.style.cssText = `
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        padding: 10px;
        display: flex;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    return menu;
}

// Share to social media
export function shareToSocial(platform, videoTitle, videoUrl) {
    const encodedUrl = encodeURIComponent(videoUrl);
    const encodedTitle = encodeURIComponent(videoTitle);
    
    let shareUrl = '';
    
    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Export functions
export {
    setupInteractionHandlers,
    sendMessage,
    loadCommentsList,
    escapeHtml,
    formatCommentTime,
    setupReactions,
    shareToSocial
};
