// Configuration - Update this with your server URL
const API_URL = window.location.origin;

// Direct function to open widget (called from HTML onclick)
function openWidgetDirectly() {
    console.log('🟢 openWidgetDirectly() called');
    const container = document.getElementById('widgetContainer');
    const button = document.getElementById('widgetButton');
    const messages = document.getElementById('widgetMessages');
    const input = document.getElementById('widgetInput');
    
    if (!container || !button) {
        console.log('❌ Elements not found:', { container: !!container, button: !!button });
        return;
    }
    
    container.classList.add('active');
    button.classList.add('hidden');
    
    setTimeout(() => {
        if (messages) messages.scrollTop = messages.scrollHeight;
        if (input) input.focus();
        console.log('✅ Widget opened');
    }, 50);
}

// Initialize widget when page loads
window.addEventListener('load', function() {
    // Get DOM elements
    const widgetButton = document.getElementById('widgetButton');
    const widgetContainer = document.getElementById('widgetContainer');
    const widgetClose = document.getElementById('widgetClose');
    const widgetMessages = document.getElementById('widgetMessages');
    const widgetInput = document.getElementById('widgetInput');
    const widgetSend = document.getElementById('widgetSend');

    console.log('Widget: Checking for elements...');
    console.log('Button:', widgetButton ? '✓' : '✗');
    console.log('Container:', widgetContainer ? '✓' : '✗');

    // Verify critical elements exist
    if (!widgetButton || !widgetContainer || !widgetMessages || !widgetInput || !widgetSend) {
        console.error('❌ Widget elements not found!');
        return;
    }

    console.log('✅ All widget elements found!');

    let conversationId = generateConversationId();
    let isProcessing = false;

    // ===== BUTTON CLICK =====
    widgetButton.onclick = function(e) {
        console.log('🔵 Button clicked - opening chat');
        e.preventDefault();
        e.stopPropagation();
        
        // Show widget
        widgetContainer.classList.add('active');
        widgetButton.classList.add('hidden');
        
        // Scroll and focus
        setTimeout(() => {
            widgetMessages.scrollTop = widgetMessages.scrollHeight;
            widgetInput.focus();
            console.log('✓ Widget opened, scrolled, focused');
        }, 50);
    };

    // ===== CLOSE BUTTON =====
    widgetClose.onclick = function(e) {
        console.log('❌ Close button clicked');
        e.preventDefault();
        e.stopPropagation();
        widgetContainer.classList.remove('active');
        widgetButton.classList.remove('hidden');
    };

    // ===== SEND BUTTON =====
    widgetSend.onclick = sendMessage;

    // ===== INPUT ENTER KEY =====
    widgetInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // ===== SEND MESSAGE FUNCTION =====
    async function sendMessage(e) {
        if (e) {
            e.preventDefault();
        }

        const message = widgetInput.value.trim();
        if (!message || isProcessing) return;

        isProcessing = true;
        widgetSend.disabled = true;

        // Add user message
        addMessage('user', message);
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
            removeTypingIndicator(typingId);

            if (response.ok) {
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

    // ===== ADD MESSAGE =====
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
        widgetMessages.scrollTop = widgetMessages.scrollHeight;
    }

    // ===== TYPING INDICATOR =====
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
        widgetMessages.scrollTop = widgetMessages.scrollHeight;

        return typingId;
    }

    // ===== REMOVE TYPING INDICATOR =====
    function removeTypingIndicator(typingId) {
        const element = document.getElementById(typingId);
        if (element) {
            element.remove();
        }
    }

    // ===== GENERATE CONVERSATION ID =====
    function generateConversationId() {
        return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    console.log('✅ Widget initialized successfully!');
});

// Helper function (outside load event)
function generateConversationId() {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
