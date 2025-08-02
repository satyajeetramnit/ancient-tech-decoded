// DOM Elements
const navLinks = document.querySelectorAll('.nav__link');
const episodeCards = document.querySelectorAll('.episode-card');
const audioButtons = document.querySelectorAll('.audio-btn');
const techItems = document.querySelectorAll('.tech-item');
const newsletterForm = document.querySelector('.newsletter-form');
const nav = document.querySelector('.nav');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAudioButtons();
    initializeTechGrid();
    initializeNewsletterForm();
    initializeScrollEffects();
    initializeAnimations();
});

// Navigation functionality
function initializeNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Remove active class from all links
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Smooth scroll to target section
                const navHeight = nav.offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Audio button functionality
function initializeAudioButtons() {
    audioButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const episodeNumber = index + 1;
            
            // Toggle play/pause state
            if (this.textContent.includes('▶')) {
                this.textContent = '⏸ Pause Episode';
                this.classList.add('playing');
                simulateAudioPlayback(this, episodeNumber);
            } else {
                this.textContent = '▶ Play Episode';
                this.classList.remove('playing');
                stopAudioPlayback(this);
            }
            
            // Stop other playing episodes
            audioButtons.forEach((otherButton, otherIndex) => {
                if (otherIndex !== index && otherButton.classList.contains('playing')) {
                    otherButton.textContent = '▶ Play Episode';
                    otherButton.classList.remove('playing');
                    stopAudioPlayback(otherButton);
                }
            });
        });
    });
}

// Simulate audio playback
function simulateAudioPlayback(button, episodeNumber) {
    let progress = 0;
    const duration = 30; // 30 seconds for demo
    
    const interval = setInterval(() => {
        progress++;
        const percentage = (progress / duration) * 100;
        
        // Update button text with progress
        button.textContent = `⏸ Playing... ${Math.round(percentage)}%`;
        
        if (progress >= duration) {
            clearInterval(interval);
            button.textContent = '▶ Play Episode';
            button.classList.remove('playing');
        }
    }, 1000);
    
    // Store interval for cleanup
    button.playbackInterval = interval;
}

// Stop audio playback
function stopAudioPlayback(button) {
    if (button.playbackInterval) {
        clearInterval(button.playbackInterval);
        button.playbackInterval = null;
    }
}

// Technology grid interactions
function initializeTechGrid() {
    techItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            // Add glow effect to connector
            const connector = this.querySelector('.tech-item__connector');
            if (connector) {
                connector.style.boxShadow = '0 0 20px rgba(50, 184, 198, 0.6)';
            }
            
            // Highlight category
            const category = this.dataset.category;
            if (category) {
                this.style.background = 'var(--color-bg-1)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            // Remove glow effect
            const connector = this.querySelector('.tech-item__connector');
            if (connector) {
                connector.style.boxShadow = 'none';
            }
            
            // Reset background
            this.style.background = 'var(--color-surface)';
        });
        
        // Add click interaction for more details
        item.addEventListener('click', function() {
            const ancient = this.querySelector('.tech-item__ancient').textContent;
            const modern = this.querySelector('.tech-item__modern').textContent;
            const description = this.querySelector('.tech-item__description').textContent;
            
            showTechDetails(ancient, modern, description);
        });
    });
}

// Show technology details modal
function showTechDetails(ancient, modern, description) {
    // Create modal dynamically
    const modal = document.createElement('div');
    modal.className = 'tech-modal';
    modal.innerHTML = `
        <div class="tech-modal__backdrop">
            <div class="tech-modal__content">
                <button class="tech-modal__close">&times;</button>
                <h3 class="tech-modal__title">${ancient} ↔ ${modern}</h3>
                <p class="tech-modal__description">${description}</p>
                <div class="tech-modal__actions">
                    <button class="btn btn--primary tech-modal__explore">Explore Episode</button>
                    <button class="btn btn--outline tech-modal__close-btn">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .tech-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            animation: fadeIn 0.3s ease-out;
        }
        
        .tech-modal__backdrop {
            width: 100%;
            height: 100%;
            background: rgba(19, 52, 59, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-20);
        }
        
        .tech-modal__content {
            background: var(--color-surface);
            border-radius: var(--radius-lg);
            padding: var(--space-32);
            max-width: 500px;
            width: 100%;
            position: relative;
            border: 1px solid var(--color-teal-300);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .tech-modal__close {
            position: absolute;
            top: var(--space-16);
            right: var(--space-16);
            background: none;
            border: none;
            font-size: var(--font-size-2xl);
            color: var(--color-text-secondary);
            cursor: pointer;
            transition: color var(--duration-fast) var(--ease-standard);
        }
        
        .tech-modal__close:hover {
            color: var(--color-teal-300);
        }
        
        .tech-modal__title {
            font-size: var(--font-size-xl);
            margin-bottom: var(--space-16);
            color: var(--color-teal-300);
            text-align: center;
        }
        
        .tech-modal__description {
            margin-bottom: var(--space-24);
            line-height: 1.6;
            text-align: center;
        }
        
        .tech-modal__actions {
            display: flex;
            gap: var(--space-12);
            justify-content: center;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeButtons = modal.querySelectorAll('.tech-modal__close, .tech-modal__close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
    });
    
    // Close on backdrop click
    modal.querySelector('.tech-modal__backdrop').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });
    
    // Explore episode functionality
    modal.querySelector('.tech-modal__explore').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        
        // Scroll to episodes section
        const episodesSection = document.querySelector('#episodes');
        if (episodesSection) {
            const navHeight = nav.offsetHeight;
            const targetPosition = episodesSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
}

// Newsletter form functionality
function initializeNewsletterForm() {
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();
            
            if (!email || !isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            submitButton.textContent = 'Subscribing...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                showNotification('Thank you! You\'ve been subscribed to Ancient Tech Decoded updates.', 'success');
                emailInput.value = '';
                submitButton.textContent = 'Subscribe';
                submitButton.disabled = false;
            }, 2000);
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: var(--space-20);
            background: var(--color-surface);
            color: var(--color-text);
            padding: var(--space-16) var(--space-20);
            border-radius: var(--radius-base);
            box-shadow: var(--shadow-lg);
            border-left: 4px solid var(--color-info);
            z-index: 1500;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        }
        
        .notification--success {
            border-left-color: var(--color-success);
        }
        
        .notification--error {
            border-left-color: var(--color-error);
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }
        }, 300);
    }, 5000);
}

// Scroll effects
function initializeScrollEffects() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide/show navigation on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            nav.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        
        // Update active navigation link based on scroll position
        updateActiveNavLink();
    });
}

// Update active navigation link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navHeight = nav.offsetHeight;
    const scrollPos = window.scrollY + navHeight + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const correspondingLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    });
}

// Initialize animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.episode-card, .tech-item, .text-card, .theme-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Floating city animation enhancement
function enhanceFloatingCity() {
    const floatingCity = document.querySelector('.floating-city');
    if (floatingCity) {
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', function(e) {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
            
            floatingCity.style.transform = `
                translateY(-20px) 
                rotateY(${mouseX * 10}deg) 
                rotateX(${mouseY * 5}deg)
            `;
        });
    }
}

// Initialize enhanced floating city animation
enhanceFloatingCity();

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        const modal = document.querySelector('.tech-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }
    
    // Arrow key navigation for episodes
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const focusedCard = document.activeElement;
        if (focusedCard && focusedCard.classList.contains('episode-card')) {
            const cards = Array.from(episodeCards);
            const currentIndex = cards.indexOf(focusedCard);
            let nextIndex;
            
            if (e.key === 'ArrowLeft') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
            } else {
                nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
            }
            
            cards[nextIndex].focus();
            e.preventDefault();
        }
    }
});

// Make episode cards focusable for keyboard navigation
episodeCards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const audioButton = this.querySelector('.audio-btn');
            if (audioButton) {
                audioButton.click();
            }
            e.preventDefault();
        }
    });
});