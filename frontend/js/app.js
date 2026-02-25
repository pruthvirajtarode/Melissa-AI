// Configuration
const API_URL = window.location.origin;
let conversationId = generateConversationId();
let isProcessing = false;
let botSettings = {
    avatarUrl: 'images/bot-silhouette.svg',
    botName: 'MelissAI',
    welcomeMessage: "Hi! I'm MelissAI, your business development assistant. How can I help you today?"
};

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const chatContainer = document.getElementById('chatContainer');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const newChatBtn = document.getElementById('newChatBtn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadSettings();
    adjustTextareaHeight();
});

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/api/settings`);
        if (response.ok) {
            const settings = await response.json();
            botSettings = { ...botSettings, ...settings };

            // Update UI elements if they exist
            const welcomeText = document.querySelector('.welcome-subtitle');
            if (welcomeText && settings.welcomeMessage) {
                welcomeText.textContent = settings.welcomeMessage;
            }

            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle && settings.botName) {
                heroTitle.textContent = settings.botName;
            }
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Event Listeners
function setupEventListeners() {
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter (without Shift)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', adjustTextareaHeight);

    // Suggestion cards
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            console.log('Suggestion card clicked:', card.dataset.prompt);
            const prompt = card.dataset.prompt;
            messageInput.value = prompt;
            sendMessage();
        });
    });

    // New chat button - with null check and logging
    if (newChatBtn) {
        console.log('New Chat button found, attaching listener');
        newChatBtn.addEventListener('click', () => {
            console.log('New Chat button clicked');
            startNewChat();
        });
    } else {
        console.error('New Chat button not found in DOM!');
    }
}

// Send Message
async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message || isProcessing) return;

    isProcessing = true;
    sendButton.disabled = true;

    // Hide welcome screen, show chat
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'block';

    // Add user message
    addMessage('user', message);

    // Clear input
    messageInput.value = '';
    adjustTextareaHeight();

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
            addMessage('assistant', data.response, {
                responseTime: data.responseTime,
                contextUsed: data.contextUsed
            });
        } else {
            throw new Error(data.error || 'Failed to get response');
        }
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingId);
        addMessage('assistant', `I apologize, but I encountered an error: ${error.message}. Please try again.`);
    } finally {
        isProcessing = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Add Message to Chat
function addMessage(role, content, meta = {}) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    if (role === 'user') {
        avatar.textContent = '👤';
    } else {
        avatar.innerHTML = `<img src="${botSettings.avatarUrl}" alt="${botSettings.botName}" class="avatar-img">`;
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Format message content (support markdown-like formatting)
    contentDiv.innerHTML = formatMessage(content);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    // Add metadata if available
    if (Object.keys(meta).length > 0) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';

        if (meta.responseTime) {
            metaDiv.innerHTML += `<span>⚡ ${meta.responseTime}ms</span>`;
        }

        if (meta.contextUsed) {
            metaDiv.innerHTML += `<span>📚 Internal knowledge used</span>`;
        }

        contentDiv.appendChild(metaDiv);
    }

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Format Message (simple markdown-like formatting)
function formatMessage(text) {
    if (!text) return '';

    // 1. Convert markdown links: [text](url) -> <a href="url" target="_blank">text</a>
    text = text.replace(/\[([^\]]+)\]\s*\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--text-accent, #22c55e); text-decoration: underline;">$1</a>');

    // 2. Handle bare URLs
    text = text.replace(/(^|\s)(https?:\/\/[^\s<]+[^.,\s<])/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--text-accent, #22c55e); text-decoration: underline;">$2</a>');

    // 2. Convert bold markdown **text** to <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 3. Handle unordered lists starting with -
    const lines = text.split('\n');
    let inList = false;
    let inOrderedList = false;
    let formattedLines = [];

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Unordered list block
        if (trimmedLine.startsWith('- ')) {
            if (!inList) {
                formattedLines.push('<ul>');
                inList = true;
            }
            formattedLines.push(`<li>${trimmedLine.substring(2)}</li>`);
        }
        // Ordered list block
        else if (/^\d+\. /.test(trimmedLine)) {
            if (!inOrderedList) {
                formattedLines.push('<ol>');
                inOrderedList = true;
            }
            formattedLines.push(`<li>${trimmedLine.replace(/^\d+\. /, '')}</li>`);
        }
        else {
            if (inList) {
                formattedLines.push('</ul>');
                inList = false;
            }
            if (inOrderedList) {
                formattedLines.push('</ol>');
                inOrderedList = false;
            }
            formattedLines.push(line + (line.trim() ? '<br>' : ''));
        }
    });

    if (inList) formattedLines.push('</ul>');
    if (inOrderedList) formattedLines.push('</ol>');

    return formattedLines.join('');
}

// Typing Indicator
function showTypingIndicator() {
    const typingId = `typing-${Date.now()}`;
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = 'message assistant';

    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${botSettings.avatarUrl}" alt="${botSettings.botName}" class="avatar-img">
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    scrollToBottom();

    return typingId;
}

function removeTypingIndicator(typingId) {
    const element = document.getElementById(typingId);
    if (element) {
        element.remove();
    }
}

// Auto-resize Textarea
function adjustTextareaHeight() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
}

// Scroll to Bottom
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Start New Chat
function startNewChat() {
    console.log('Starting new chat...');
    conversationId = generateConversationId();
    messagesContainer.innerHTML = '';
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    messageInput.value = '';
    messageInput.focus();
    console.log('New chat started successfully');
}

// Generate Conversation ID
function generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Error Handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
