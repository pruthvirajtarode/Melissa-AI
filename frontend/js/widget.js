// Configuration - Update this with your server URL
const API_URL = window.location.origin;
let botSettings = {
    avatarUrl: 'images/meliss-avatar.svg',
    botName: 'MelissAI',
    welcomeMessage: "Hi! I'm MelissAI, your business development assistant. How can I help you today?"
};

// Global variables
let conversationId = generateConversationId();
let isProcessing = false;

// Direct function to open widget (called from HTML onclick)
function openWidgetDirectly() {
    const container = document.getElementById('widgetContainer');
    const button = document.getElementById('widgetButton');
    const messages = document.getElementById('widgetMessages');
    const input = document.getElementById('widgetInput');

    if (!container || !button) return;

    container.classList.add('active');
    button.classList.add('hidden');

    setTimeout(() => {
        if (messages) messages.scrollTop = messages.scrollHeight;
        if (input) input.focus();
    }, 100);
}

// Direct function to close widget (called from HTML onclick)
function closeWidgetDirectly() {
    const container = document.getElementById('widgetContainer');
    const button = document.getElementById('widgetButton');

    if (!container || !button) return;

    container.classList.remove('active');
    button.classList.remove('hidden');

    // Notify parent if embedded
    if (window.self !== window.top) {
        window.parent.postMessage('closeWidget', '*');
    }
}

// Initialize widget
window.addEventListener('load', async function () {
    await loadSettings();

    const widgetButton = document.getElementById('widgetButton');
    const widgetContainer = document.getElementById('widgetContainer');
    const widgetClose = document.getElementById('widgetClose');
    const widgetMessages = document.getElementById('widgetMessages');
    const widgetInput = document.getElementById('widgetInput');
    const widgetSend = document.getElementById('widgetSend');

    if (!widgetButton || !widgetContainer || !widgetMessages || !widgetInput || !widgetSend) {
        console.error('Widget elements missing');
        return;
    }

    // Check if embedded in iframe
    const isEmbedded = window.self !== window.top;
    if (isEmbedded) {
        // When embedded, we strictly show the chat window and hide the internal trigger
        widgetContainer.classList.add('active');
        widgetContainer.classList.add('embedded');
        widgetButton.classList.add('hidden');
        widgetButton.style.setProperty('display', 'none', 'important');

        // Also hide the close button if we want the parent to manage it
        if (widgetClose) {
            widgetClose.style.display = 'none';
        }
    }

    // Apply settings
    updateWidgetUI();

    widgetButton.onclick = openWidgetDirectly;
    widgetClose.onclick = closeWidgetDirectly;
    widgetSend.onclick = sendMessage;
    widgetInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    async function sendMessage() {
        const message = widgetInput.value.trim();
        if (!message || isProcessing) return;

        isProcessing = true;
        widgetSend.disabled = true;

        addMessage('user', message);
        widgetInput.value = '';

        const typingId = showTypingIndicator();

        try {
            // Use streaming endpoint for near-instant responses
            const response = await fetch(`${API_URL}/api/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, conversationId })
            });

            if (!response.ok || !response.body) {
                throw new Error('Stream not available');
            }

            // Remove typing indicator and create empty assistant bubble
            removeTypingIndicator(typingId);
            const { messageDiv, contentDiv } = createStreamingBubble();

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.token) {
                            fullText += data.token;
                            contentDiv.innerHTML = formatMessage(fullText);
                            widgetMessages.scrollTop = widgetMessages.scrollHeight;
                        }
                        if (data.done || data.error) break;
                    } catch (e) { /* skip malformed chunk */ }
                }
            }

        } catch (streamError) {
            // Fallback to regular endpoint if streaming fails
            console.warn('Stream failed, using standard endpoint:', streamError);
            try {
                const response = await fetch(`${API_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, conversationId })
                });
                const data = await response.json();
                removeTypingIndicator(typingId);
                if (response.ok) {
                    addMessage('assistant', data.response);
                } else {
                    addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
                }
            } catch (err) {
                removeTypingIndicator(typingId);
                addMessage('assistant', 'Sorry, I encountered a connection error.');
            }
        } finally {
            isProcessing = false;
            widgetSend.disabled = false;
            widgetInput.focus();
        }
    }

    // Creates an empty assistant bubble ready for streaming text
    function createStreamingBubble() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'widget-message assistant';

        const avatar = document.createElement('div');
        avatar.className = 'widget-avatar';
        avatar.innerHTML = `<img src="${botSettings.avatarUrl}" alt="${botSettings.botName}" class="widget-avatar-image" />`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'widget-message-content streaming';
        contentDiv.textContent = '';

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        widgetMessages.appendChild(messageDiv);
        widgetMessages.scrollTop = widgetMessages.scrollHeight;

        return { messageDiv, contentDiv };
    }

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `widget-message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'widget-avatar';

        if (role === 'assistant') {
            avatar.innerHTML = `<img src="${botSettings.avatarUrl}" alt="${botSettings.botName}" class="widget-avatar-image" />`;
        } else {
            avatar.textContent = '👤';
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'widget-message-content';
        contentDiv.innerHTML = formatMessage(content);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        widgetMessages.appendChild(messageDiv);
        widgetMessages.scrollTop = widgetMessages.scrollHeight;
    }

    function formatMessage(text) {
        if (!text) return '';
        // Convert line breaks
        text = text.replace(/\n/g, '<br>');
        // Bold text
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        text = text.replace(/^- (.*?)(<br>|$)/gm, '<li>$1</li>');
        return text;
    }


    function showTypingIndicator() {
        const typingId = `typing-${Date.now()}`;
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'widget-message assistant';
        typingDiv.innerHTML = `
            <div class="widget-avatar">
                <img src="${botSettings.avatarUrl}" alt="${botSettings.botName}" class="widget-avatar-image" />
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
        widgetMessages.scrollTop = widgetMessages.scrollHeight;
        return typingId;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function updateWidgetUI() {
        const welcomeAvatar = document.querySelector('.widget-avatar-image');
        if (welcomeAvatar) {
            welcomeAvatar.src = botSettings.avatarUrl;
        }

        const welcomeTitle = document.querySelector('.widget-welcome-text h3');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Hi! I'm ${botSettings.botName}`;
        }

        const welcomeText = document.querySelector('.widget-welcome-text p');
        if (welcomeText) {
            welcomeText.textContent = botSettings.welcomeMessage;
        }

        const widgetTitle = document.querySelector('.widget-title span');
        if (widgetTitle) {
            widgetTitle.textContent = botSettings.botName;
        }
    }
});

async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/api/settings`);
        if (response.ok) {
            const data = await response.json();
            botSettings = { ...botSettings, ...data };
        }
    } catch (e) { console.error('Settings load error', e); }
}

function generateConversationId() {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
