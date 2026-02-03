# Melissa AI Widget Integration Guide

## 📦 Embedding Melissa AI on Your Website

This guide shows you how to add the Melissa AI chatbot to your website.

---

## Method 1: Iframe Embed (Easiest)

### Full Widget

Add this code to your website's HTML, just before the closing `</body>` tag:

```html
<iframe 
  src="http://localhost:3000/widget.html" 
  style="position: fixed; bottom: 0; right: 0; width: 450px; height: 700px; border: none; z-index: 9999;"
  title="Melissa AI Chat"
></iframe>
```

**For Production:** Replace `http://localhost:3000` with your deployed URL.

### Mobile Responsive

```html
<iframe 
  src="http://localhost:3000/widget.html" 
  style="position: fixed; bottom: 0; right: 0; border: none; z-index: 9999;"
  class="melissa-widget"
  title="Melissa AI Chat"
></iframe>

<style>
.melissa-widget {
  width: 450px;
  height: 700px;
}

@media (max-width: 480px) {
  .melissa-widget {
    width: 100vw;
    height: 100vh;
    bottom: 0;
    right: 0;
  }
}
</style>
```

---

## Method 2: JavaScript Embed (More Control)

### Step 1: Add the Script

Add this before the closing `</body>` tag:

```html
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = 'http://localhost:3000/widget.html';
  iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:450px;height:700px;border:none;z-index:9999;';
  iframe.title = 'Melissa AI Chat';
  
  // Wait for DOM to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(iframe);
    });
  } else {
    document.body.appendChild(iframe);
  }
})();
</script>
```

### Step 2: Customize (Optional)

```javascript
// Custom positioning
iframe.style.bottom = '20px';
iframe.style.right = '20px';

// Custom size
iframe.style.width = '400px';
iframe.style.height = '600px';

// Hide on mobile
if (window.innerWidth < 768) {
  iframe.style.display = 'none';
}
```

---

## Method 3: Direct Integration (Advanced)

Copy the widget HTML/CSS/JS into your own codebase and customize fully.

### Files to Copy:

1. `public/widget.html` (structure)
2. `public/css/widget.css` (styling)
3. `public/js/widget.js` (functionality)

### Customize API URL:

In `widget.js`, change:

```javascript
const API_URL = 'https://your-melissa-ai-server.com';
```

---

## 🎨 Styling Options

### Change Widget Position

```css
/* Bottom Left */
iframe {
  left: 20px;
  right: auto;
}

/* Top Right */
iframe {
  top: 20px;
  bottom: auto;
}
```

### Change Colors

Edit `public/css/widget.css`:

```css
/* Change gradient colors */
.widget-header {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}

.widget-button {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### Custom Size

```css
/* Smaller widget */
iframe {
  width: 350px;
  height: 500px;
}

/* Larger widget */
iframe {
  width: 500px;
  height: 800px;
}
```

---

## 🔧 Configuration Options

### Hide on Specific Pages

```javascript
// Don't show on checkout page
if (window.location.pathname === '/checkout') {
  iframe.style.display = 'none';
}
```

### Show After Delay

```javascript
// Show after 5 seconds
setTimeout(function() {
  document.body.appendChild(iframe);
}, 5000);
```

### Show on Scroll

```javascript
var shown = false;
window.addEventListener('scroll', function() {
  if (!shown && window.scrollY > 500) {
    document.body.appendChild(iframe);
    shown = true;
  }
});
```

---

## 📱 Mobile Optimization

### Hide on Mobile

```javascript
if (window.innerWidth > 768) {
  document.body.appendChild(iframe);
}
```

### Full Screen on Mobile

```css
@media (max-width: 768px) {
  iframe {
    width: 100% !important;
    height: 100% !important;
    bottom: 0 !important;
    right: 0 !important;
  }
}
```

---

## 🔒 Security Considerations

### CORS Headers

If embedding across domains, ensure your server has proper CORS headers:

```javascript
// In server/index.js
app.use(cors({
  origin: ['https://yourwebsite.com'],
  credentials: true
}));
```

### Content Security Policy

Add to your website's CSP:

```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-src 'self' https://your-melissa-ai.com;">
```

---

## 🎯 Usage Examples

### WordPress

Add to your theme's `footer.php`:

```php
<?php if (!is_admin()): ?>
<iframe 
  src="https://your-melissa-ai.com/widget.html" 
  style="position: fixed; bottom: 0; right: 0; width: 450px; height: 700px; border: none; z-index: 9999;"
></iframe>
<?php endif; ?>
```

### React

```jsx
function App() {
  return (
    <div>
      {/* Your app content */}
      
      <iframe
        src="https://your-melissa-ai.com/widget.html"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '450px',
          height: '700px',
          border: 'none',
          zIndex: 9999
        }}
        title="Melissa AI"
      />
    </div>
  );
}
```

### Vue

```vue
<template>
  <div id="app">
    <!-- Your app content -->
    
    <iframe
      src="https://your-melissa-ai.com/widget.html"
      :style="widgetStyle"
      title="Melissa AI"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      widgetStyle: {
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '450px',
        height: '700px',
        border: 'none',
        zIndex: 9999
      }
    }
  }
}
</script>
```

### Shopify

Add to `theme.liquid` before `</body>`:

```liquid
{% unless template contains 'checkout' %}
<iframe 
  src="https://your-melissa-ai.com/widget.html" 
  style="position: fixed; bottom: 0; right: 0; width: 450px; height: 700px; border: none; z-index: 9999;"
></iframe>
{% endunless %}
```

---

## 📊 Tracking & Analytics

### Track Widget Opens

```javascript
// Add event listener to track when widget is opened
window.addEventListener('message', function(event) {
  if (event.data.type === 'widget-opened') {
    // Send to your analytics
    gtag('event', 'widget_opened', {
      'event_category': 'engagement'
    });
  }
});
```

---

## 🆘 Troubleshooting

### Widget Not Showing

1. Check browser console for errors
2. Verify the iframe src URL is correct
3. Check z-index conflicts with other elements

### CORS Errors

- Ensure your server allows cross-origin requests
- Add proper CORS headers on the backend

### Widget Too Small/Large

- Adjust width/height in iframe style
- Check mobile responsive CSS

---

## 🚀 Production Checklist

- [ ] Replace localhost URLs with production URLs
- [ ] Set up CORS properly
- [ ] Test on all target browsers
- [ ] Test on mobile devices
- [ ] Add CSP headers if needed
- [ ] Test widget performance
- [ ] Add analytics tracking

---

## 💡 Best Practices

1. **Load Asynchronously** - Don't block page load
2. **Mobile First** - Ensure good mobile experience
3. **Accessibility** - Add proper title attributes
4. **Performance** - Lazy load if needed
5. **Testing** - Test thoroughly before deployment

---

**Need more help?** Check the main README.md or open an issue!
