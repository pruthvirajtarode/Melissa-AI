// Configuration - Update this with your server URL
const API_URL = window.location.origin;
let conversationId = generateConversationId();
let isProcessing = false;

// DOM Elements
const widgetButton = document.getElementById('widgetButton');
const widgetContainer = document.getElementById('widgetContainer');
const widgetClose = document.getElementById('widgetClose');
const widgetMessages = document.getElementById('widgetMessages');
const widgetInput = document.getElementById('widgetInput');
const widgetSend = document.getElementById('widgetSend');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    widgetButton.addEventListener('click', openWidget);
    widgetClose.addEventListener('click', closeWidget);
    widgetSend.addEventListener('click', sendMessage);

    widgetInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Open/Close Widget
function openWidget() {
    widgetContainer.classList.add('active');
    widgetButton.classList.add('hidden');
    setTimeout(() => {
        scrollToBottom();
        widgetInput.focus();
    }, 50);
}

function closeWidget() {
    widgetContainer.classList.remove('active');
    widgetButton.classList.remove('hidden');
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
