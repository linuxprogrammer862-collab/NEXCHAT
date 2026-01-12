// ui.js - UI Enhancement and Interactive Elements
import { appState } from './app.js';

// Initialize UI enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeUIInteractions();
});

function initializeUIInteractions() {
    // Smooth scrolling
    setupSmoothScroll();
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Theme toggle (optional dark/light mode)
    setupTheme();
    
    // Auto-hide navbar on scroll
    setupAutoHideNavbar();
    
    // Lazy loading for images
    setupLazyLoading();
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Ctrl/Cmd + U for upload
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            // openUploadModal() - imported from app.js
        }
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function setupTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('nexreels-theme') || 'dark';
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Theme toggle (can be added to settings)
    window.toggleTheme = function() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('nexreels-theme', newTheme);
    };
}

function setupAutoHideNavbar() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 60) {
            // Scroll down
            navbar.style.top = '-60px';
        } else {
            // Scroll up
            navbar.style.top = '0';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
}

function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Notification system
export function showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            icon: 'https://via.placeholder.com/128?text=NEX-REELS',
            badge: 'https://via.placeholder.com/128?text=NEX-REELS',
            ...options
        });
    }
}

// Request notification permission
export function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Analytics tracking (optional)
export function trackEvent(eventName, eventData = {}) {
    if (window.gtag) {
        window.gtag('event', eventName, eventData);
    }
}

// Performance monitoring
export function logPerformance() {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page Load Time:', pageLoadTime + 'ms');
    }
}

// Initialize video card animations
export function animateVideoCards() {
    const cards = document.querySelectorAll('.video-card');
    
    cards.forEach((card, index) => {
        card.style.animation = `fadeIn 0.5s ease-in-out ${index * 0.1}s both`;
    });
}

// Add focus management for accessibility
export function setupAccessibility() {
    // Add focus styles
    const style = document.createElement('style');
    style.textContent = `
        *:focus-visible {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
    
    // Trap focus in modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const modals = document.querySelectorAll('.modal.show');
            if (modals.length > 0) {
                const modal = modals[modals.length - 1];
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length === 0) {
                    e.preventDefault();
                    return;
                }
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        }
    });
}

// Enhanced form validation
export function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
        
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.style.borderColor = 'var(--error-color)';
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Video quality selector
export function setupVideoQualitySelector() {
    const videoElement = document.querySelector('.player-video');
    if (videoElement) {
        // Add quality selector UI
        const qualitySelector = document.createElement('select');
        qualitySelector.innerHTML = `
            <option value="720">720p</option>
            <option value="480">480p</option>
            <option value="360">360p</option>
        `;
        qualitySelector.className = 'quality-selector';
        // Could be appended to player controls
    }
}

// Dark mode toggle in sidebar
export function setupThemeToggle() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const themeToggle = document.createElement('button');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Theme';
        themeToggle.className = 'sidebar-link';
        themeToggle.addEventListener('click', () => {
            toggleTheme();
        });
        sidebar.appendChild(themeToggle);
    }
}

// Gesture support for mobile
export function setupGestureSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swiped left
            console.log('Swiped left');
        }
        if (touchEndX > touchStartX + 50) {
            // Swiped right
            console.log('Swiped right');
        }
    }
}

// Export all UI functions
export {
    initializeUIInteractions,
    closeAllModals,
    setupAccessibility
};
