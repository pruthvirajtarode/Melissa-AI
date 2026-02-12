# Melissa AI Website Integration Guide

This guide provides the necessary code and instructions to embed the Melissa AI Chatbot into your website. You can choose from the options below depending on how you want the bot to appear.

---

## Option 1: Floating Chat Widget (Recommended)
This is the most popular way to add a chatbot. It appears as a floating button in the bottom-right corner of your website, which opens the chat when clicked.

Add this code just before the closing `</body>` tag of your website:

```html
<!-- Melissa AI Floating Widget -->
<div id="melissa-ai-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 999999;">
  <button id="melissa-trigger" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease;">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
  </button>
  
  <div id="melissa-container" style="display: none; position: absolute; bottom: 80px; right: 0; width: 400px; height: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); background: white; border: 1px solid #e5e7eb;">
    <iframe 
      src="https://melissa-ai.vercel.app/" 
      style="width: 100%; height: 100%; border: none;" 
      title="Melissa AI">
    </iframe>
  </div>
</div>

<script>
  (function() {
    const trigger = document.getElementById('melissa-trigger');
    const container = document.getElementById('melissa-container');
    let isOpen = false;

    trigger.addEventListener('click', () => {
      isOpen = !isOpen;
      container.style.display = isOpen ? 'block' : 'none';
      trigger.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
      
      if (isOpen && window.innerWidth < 480) {
        container.style.width = 'calc(100vw - 40px)';
        container.style.height = 'calc(100vh - 120px)';
      }
    });
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
    title="Melissa AI">
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
    title="Melissa AI">
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
