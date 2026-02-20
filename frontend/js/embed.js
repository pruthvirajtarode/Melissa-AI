/**
 * MelissAI - Client Embed Script
 * This script dynamically creates the chat button and iframe for the MelissAI widget.
 */
(function () {
    // Detect script origin to find where MelissAI is hosted
    const scriptTag = document.currentScript;
    const scriptUrl = scriptTag ? scriptTag.src : '';
    const scriptOrigin = scriptUrl ? new URL(scriptUrl).origin : window.location.origin;

    // Default Configuration
    const defaultConfig = {
        apiUrl: scriptOrigin,
        buttonColor: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)',
        position: 'bottom-right', // bottom-right, bottom-left
        botName: 'MelissAI'
    };

    // Merge user config if available
    const config = window.MELISS_CONFIG ? { ...defaultConfig, ...window.MELISS_CONFIG } : defaultConfig;

    // Create Container
    const container = document.createElement('div');
    container.id = 'meliss-ai-widget-container';
    container.style.cssText = 'position: fixed; z-index: 999999;';

    // Apply position
    if (config.position === 'bottom-left') {
        container.style.bottom = '25px';
        container.style.left = '25px';
    } else {
        container.style.bottom = '25px';
        container.style.right = '25px';
    }

    // Create Button
    const button = document.createElement('button');
    button.id = 'meliss-widget-button';
    button.setAttribute('aria-label', `Chat with ${config.botName}`);
    button.style.cssText = `
        width: 65px;
        height: 65px;
        border-radius: 50%;
        background: ${config.buttonColor};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(34, 197, 94, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    // Button Icon (SVG)
    button.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    `;

    // Create Iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'meliss-widget-iframe';
    iframe.src = `${config.apiUrl}/widget.html`;
    iframe.style.cssText = `
        position: fixed;
        bottom: 100px;
        ${config.position === 'bottom-left' ? 'left: 25px;' : 'right: 25px;'}
        width: 400px;
        height: 600px;
        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: none;
        z-index: 999998;
        background: transparent;
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
    `;

    // Toggle logic
    let isOpen = false;

    button.addEventListener('click', () => {
        if (!isOpen) {
            openWidget();
        } else {
            closeWidget();
        }
    });

    function openWidget() {
        isOpen = true;
        iframe.style.display = 'block';
        setTimeout(() => {
            iframe.style.opacity = '1';
            iframe.style.transform = 'translateY(0)';
            button.style.transform = 'scale(0.8) rotate(90deg)';
            button.style.opacity = '0.5';
        }, 10);
        window.dispatchEvent(new Event('meliss:opened'));
    }

    function closeWidget() {
        isOpen = false;
        iframe.style.opacity = '0';
        iframe.style.transform = 'translateY(20px)';
        button.style.transform = 'scale(1) rotate(0)';
        button.style.opacity = '1';
        setTimeout(() => {
            iframe.style.display = 'none';
        }, 300);
        window.dispatchEvent(new Event('meliss:closed'));
    }

    // Listen for messages from the widget
    window.addEventListener('message', (event) => {
        if (event.data === 'closeWidget') {
            closeWidget();
        }
    });

    // Hover effects
    button.addEventListener('mouseenter', () => {
        if (!isOpen) button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseleave', () => {
        if (!isOpen) button.style.transform = 'scale(1)';
    });

    // Add elements to page
    container.appendChild(button);
    document.body.appendChild(container);
    document.body.appendChild(iframe);

    // Responsive handling
    function checkMobile() {
        if (window.innerWidth < 480) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.bottom = '0';
            iframe.style.right = '0';
            iframe.style.left = '0';
            iframe.style.borderRadius = '0';
        } else {
            iframe.style.width = '400px';
            iframe.style.height = '600px';
            iframe.style.bottom = '100px';
            if (config.position === 'bottom-left') {
                iframe.style.left = '25px';
                iframe.style.right = 'auto';
            } else {
                iframe.style.right = '25px';
                iframe.style.left = 'auto';
            }
            iframe.style.borderRadius = '16px';
        }
    }

    window.addEventListener('resize', checkMobile);
    checkMobile();

    // Export public API
    window.MelissAI = {
        open: openWidget,
        close: closeWidget,
        toggle: () => isOpen ? closeWidget() : openWidget()
    };
})();
