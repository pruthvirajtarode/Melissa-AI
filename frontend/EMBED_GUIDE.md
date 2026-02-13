# Melissa AI Widget - Client Integration Guide

## 📦 Installation

Add the following code snippet to your website's HTML (before closing `</body>` tag):

### Standard Installation (Recommended)

```html
<!-- Melissa AI Professional Chat Widget -->
<div id="melissa-ai-bot" style="position: fixed; bottom: 25px; right: 25px; z-index: 999999;">

  <!-- Floating Button -->
  <button
    id="melissa-btn"
    style="
      width: 65px;
      height: 65px;
      border-radius: 50%;
      background: linear-gradient(135deg, #14532d 0%, #22c55e 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(34, 197, 94, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      font-size: 0;
    "
    aria-label="Open Melissa AI Chat"
  >
    <!-- Chat Icon SVG -->
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>

</div>

<!-- Melissa AI Widget Script -->
<script src="https://d4aiyhzmtitm8.cloudfront.net/melissa-ai/embed.js"></script>
<script>
  MelissaAI.init({
    apiUrl: 'https://d4aiyhzmtitm8.cloudfront.net/melissa-ai',
    buttonColor: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)',
    position: 'bottom-right'
  });
</script>
```

## 🎨 Customization Options

You can customize the widget appearance by modifying these CSS variables:

### Color Customization

#### Green Theme (Default)
```css
background: linear-gradient(135deg, #14532d 0%, #22c55e 100%);
box-shadow: 0 4px 20px rgba(34, 197, 94, 0.35);
```

#### Custom Colors
To change the gradient colors, modify the button inline style:

```html
<button
  id="melissa-btn"
  style="
    width: 65px;
    height: 65px;
    border-radius: 50%;
    background: linear-gradient(135deg, YOUR_COLOR_1 0%, YOUR_COLOR_2 100%);
    /* ... rest of styles ... */
  "
>
```

### Position Customization

**Bottom Right (Default)**
```css
position: fixed;
bottom: 25px;
right: 25px;
```

**Bottom Left**
```css
position: fixed;
bottom: 25px;
left: 25px;
```

**Top Right**
```css
position: fixed;
top: 25px;
right: 25px;
```

**Top Left**
```css
position: fixed;
top: 25px;
left: 25px;
```

### Size Customization

To make the button larger, modify the width and height:

```css
width: 80px;      /* Default: 65px */
height: 80px;     /* Default: 65px */
```

Adjust the SVG icon size accordingly:
```html
<svg width="40" height="40">  <!-- Adjust accordingly -->
```

## 🔧 Advanced Configuration

### With Custom API Endpoint

```html
<script>
  // If hosting on your own server
  window.MELISSA_CONFIG = {
    apiUrl: 'https://your-custom-domain.com/api',
    theme: 'dark',
    language: 'en'
  };
</script>
<script src="https://d4aiyhzmtitm8.cloudfront.net/melissa-ai/embed.js"></script>
```

### With Authentication Token

```html
<script>
  window.MELISSA_AUTH = {
    token: 'YOUR_AUTH_TOKEN_HERE',
    userId: 'user_unique_id'
  };
</script>
<script src="https://d4aiyhzmtitm8.cloudfront.net/melissa-ai/embed.js"></script>
```

## 📱 Responsive Behavior

The widget automatically scales and repositions on mobile devices:
- On screens smaller than 480px, the widget expands to fill the screen
- Touch-friendly sizing and spacing
- Optimized for all device sizes

## 🔒 Security

- The widget runs in an iframe for security isolation
- All communication goes through HTTPS
- No sensitive data is logged
- PCI DSS compliant

## 🧪 Testing

To test the widget integration:
1. Add the code to your website
2. Reload the page
3. Click the floating chat button
4. You should see the Melissa AI welcome message
5. Try sending a message to test functionality

## 🐛 Troubleshooting

### Widget Not Appearing
- Check browser console for JavaScript errors
- Ensure the CDN URL is accessible: `https://d4aiyhzmtitm8.cloudfront.net`
- Verify z-index is high enough (default: 999999)

### Messages Not Sending
- Check network tab in browser dev tools
- Verify API endpoint is configured correctly
- Check browser console for error messages

### Styling Issues
- Ensure no conflicting CSS on your page
- Check that inline styles are not being overridden
- Clear browser cache and reload

## 📞 Support

For integration issues or customization requests:
- Email: support@melissaai.com
- Documentation: https://docs.melissaai.com
- Issues: https://github.com/melissaai/widget/issues

## 📊 Analytics

Track widget usage with these events:
```javascript
// Widget opened
window.dispatchEvent(new Event('melissa:opened'));

// Message sent
window.dispatchEvent(new Event('melissa:message-sent'));

// Widget closed
window.dispatchEvent(new Event('melissa:closed'));
```

---

**Version:** 2.0.0  
**Last Updated:** February 2026  
**Theme:** Green (Professional)
