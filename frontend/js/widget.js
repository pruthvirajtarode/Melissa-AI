// Configuration - Update this with your server URL
const API_URL = window.location.origin;
let conversationId = generateConversationId();
let isProcessing = false;

// DOM Elements - will be set after DOMContentLoaded
let widgetButton;
let widgetContainer;
let widgetClose;
let widgetMessages;
let widgetInput;
let widgetSend;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
    // DOM already loaded
    initializeWidget();
}

function initializeWidget() {
    // Get DOM elements
    widgetButton = document.getElementById('widgetButton');
    widgetContainer = document.getElementById('widgetContainer');
    widgetClose = document.getElementById('widgetClose');
    widgetMessages = document.getElementById('widgetMessages');
    widgetInput = document.getElementById('widgetInput');
    widgetSend = document.getElementById('widgetSend');

    // Setup event listeners
    if (widgetButton) {
        widgetButton.addEventListener('click', openWidget);
        console.log('✓ Widget button listener attached');
    }
    
    if (widgetClose) {
        widgetClose.addEventListener('click', closeWidget);
    }
    
    if (widgetSend) {
        widgetSend.addEventListener('click', sendMessage);
    }

    if (widgetInput) {
        widgetInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Event Listeners
function setupEventListeners() {
    // This function is no longer used, initialization done in initializeWidget
}

// Open/Close Widget
function openWidget(e) {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    
    console.log('Opening widget...');
    
    // Add active class to trigger CSS transitions (opacity and transform)
    if (widgetContainer) {
        widgetContainer.classList.add('active');
        console.log('✓ Widget container active class added');
    }
    
    if (widgetButton) {
        widgetButton.classList.add('hidden');
        console.log('✓ Widget button hidden');
    }
    
    // Scroll to bottom after opacity transition starts (small delay)
    setTimeout(() => {
        if (widgetMessages) {
            widgetMessages.scrollTop = widgetMessages.scrollHeight;
            console.log('✓ Scrolled to bottom');
        }
        if (widgetInput) {
            widgetInput.focus();
            console.log('✓ Input focused');
        }
    }, 100);
}

function closeWidget(e) {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    
    console.log('Closing widget...');
    
    if (widgetContainer) {
        widgetContainer.classList.remove('active');
        console.log('✓ Widget container active class removed');
    }
    
    if (widgetButton) {
        widgetButton.classList.remove('hidden');
        console.log('✓ Widget button shown');
    }
}

// Send Message
async function sendMessage() {
    const message = widgetInput.value.trim();

    if (!message || isProcessing) return;

    isProcessing = true;
    widgetSend.disabled = true;

    // Add user message
    addMessage('user', message);

    // Clear input
    widgetInput.value = '';

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                conversationId
            })
        });

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator(typingId);

        if (response.ok) {
            // Add assistant response
            addMessage('assistant', data.response);
        } else {
            throw new Error(data.error || 'Failed to get response');
        }
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingId);
        addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
    } finally {
        isProcessing = false;
        widgetSend.disabled = false;
        widgetInput.focus();
    }
}

// Add Message
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `widget-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'widget-avatar';
    
    if (role === 'assistant') {
        const img = document.createElement('img');
        img.src = 'images/icon.png';
        img.alt = 'Melissa AI';
        img.className = 'widget-avatar-image';
        avatar.appendChild(img);
    } else {
        avatar.textContent = '👤';
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'widget-message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    widgetMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Typing Indicator
function showTypingIndicator() {
    const typingId = `typing-${Date.now()}`;
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = 'widget-message assistant';

    typingDiv.innerHTML = `
        <div class="widget-avatar">
            <img src="images/icon.png" alt="Melissa AI" class="widget-avatar-image" />
        </div>
        <div class="widget-message-content">
            <div class="widget-typing">
                <div class="widget-typing-dot"></div>
                <div class="widget-typing-dot"></div>
                <div class="widget-typing-dot"></div>
            </div>
        </div>
    `;

    widgetMessages.appendChild(typingDiv);
    scrollToBottom();

    return typingId;
}

function removeTypingIndicator(typingId) {
    const element = document.getElementById(typingId);
    if (element) {
        element.remove();
    }
}

// Scroll to Bottom
function scrollToBottom() {
    widgetMessages.scrollTop = widgetMessages.scrollHeight;
}

// Generate Conversation ID
function generateConversationId() {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
