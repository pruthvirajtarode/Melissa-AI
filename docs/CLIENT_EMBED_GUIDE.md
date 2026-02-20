# MelissAI Website Integration Guide

This guide provides the necessary code and instructions to embed the MelissAI Chatbot into your website. You can choose from the options below depending on how you want the bot to appear.

---

## Option 1: Floating Chat Widget (Recommended)
This is the most popular way to add a chatbot. It appears as a floating button in the bottom-right corner of your website, which opens the chat when clicked.

Add this code just before the closing `</body>` tag of your website:

```html
<!-- MelissAI Professional Chat Widget -->
<div id="meliss-ai-bot" style="position: fixed; bottom: 25px; right: 25px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <!-- Global Branding Colors -->
  <style>
    :root { --meliss-primary: linear-gradient(135deg, #14532d 0%, #22c55e 100%); }
    #meliss-btn:hover { transform: scale(1.08); box-shadow: 0 8px 25px rgba(34, 197, 94, 0.45); }
    #meliss-btn:active { transform: scale(0.95); }
  </style>

  <!-- Floating Trigger Button -->
  <button
    id="meliss-btn"
    aria-label="Open Chat"
    style="
      width: 65px;
      height: 65px;
      border-radius: 50%;
      background: var(--meliss-primary);
      border: none;
      cursor: pointer;
      box-shadow: 0 5px 20px rgba(20, 83, 45, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    "
  >
    <!-- Premium Chat Icon -->
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>

  <!-- Chat Window Container -->
  <div id="meliss-window" style="
    display: none; 
    position: absolute; 
    bottom: 85px; 
    right: 0; 
    width: 420px; 
    height: 650px; 
    border-radius: 20px; 
    overflow: hidden; 
    box-shadow: 0 25px 60px rgba(0,0,0,0.2); 
    background: white; 
    border: 1px solid rgba(0,0,0,0.08); 
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    transform: translateY(20px);
    opacity: 0;
  ">
    <iframe 
        src="https://melissa-ai.vercel.app/widget.html" 
        style="width: 100%; height: 100%; border: none;" 
        title="MelissAI Assistant"
        id="meliss-iframe">
    </iframe>
  </div>
</div>

<script>
(function() {
  const btn = document.getElementById('meliss-btn');
  const win = document.getElementById('meliss-window');
  let isOpen = false;

  // Toggle Function with Smooth Animation
  btn.onclick = () => {
    isOpen = !isOpen;
    if (isOpen) {
      win.style.display = 'block';
      setTimeout(() => {
        win.style.transform = 'translateY(0)';
        win.style.opacity = '1';
      }, 10);
      btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
      win.style.transform = 'translateY(20px)';
      win.style.opacity = '0';
      setTimeout(() => { win.style.display = 'none'; }, 300);
      btn.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    }
  };

  // Listen for the "Close" button click inside the iframe
  window.addEventListener('message', function(event) {
    if (event.data === 'closeWidget' || event.data?.type === 'closeWidget') {
      isOpen = false;
      win.style.transform = 'translateY(20px)';
      win.style.opacity = '0';
      setTimeout(() => { win.style.display = 'none'; }, 300);
      btn.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    }
  });

  // Mobile Adaptability
  function checkMobile() {
    if (window.innerWidth < 480) {
      win.style.width = 'calc(100vw - 40px)';
      win.style.height = 'calc(80vh)';
      win.style.right = '-10px';
    } else {
      win.style.width = '420px';
      win.style.height = '650px';
      win.style.right = '0';
    }
  }

  window.addEventListener('resize', checkMobile);
  checkMobile();
})();
</script>
```

---

## Option 2: Inline Embed (Fixed Section)
Use this option if you want to place the chatbot inside a specific section of your page (e.g., on a "Contact Us" or "Help" page).

```html
<div style="width: 100%; max-width: 800px; margin: 0 auto; height: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #eee;">
  <iframe 
    src="https://melissa-ai.vercel.app/" 
    width="100%" 
    height="100%" 
    style="border: none;" 
    title="MelissAI">
  </iframe>
</div>
```

---

## Option 3: Full-Page Responsive Embed
If you want the app to take up a significant portion of the screen or be fully responsive, use this CSS approach:

```html
<div style="position: relative; width: 100%; height: 80vh; min-height: 500px; border-radius: 10px; overflow: hidden;">
  <iframe 
    src="https://melissa-ai.vercel.app/" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
    title="MelissAI">
  </iframe>
</div>
```

---

## 🎨 Customizing the Look
You can adjust the parameters in the code above:
- **Width/Height**: Change `400px` or `600px` to fit your site's layout.
- **Colors**: In the Floating Widget code, change the `#6366f1` and `#a855f7` hex codes to match your brand colors.
- **Position**: Change `bottom: 20px; right: 20px;` to move the widget (e.g., `left: 20px;`).

## 🔧 Technical Notes
- **SSL**: The host website must be running on HTTPS (standard for most modern sites).
- **Mobile Support**: All options above are designed to be responsive and work on mobile devices.
- **Z-Index**: The widget uses `z-index: 999999` to ensure it stays on top of other elements.
