const tests = [
    "[https://www.newmajorityventures.net](https://www.newmajorityventures.net)",
    "[https://www.newmajorityventures.net](https://www.newmajorityventures.net).",
    "\\[https://www.newmajorityventures.net\\]\\(https://www.newmajorityventures.net\\)",
    "Visit [New Majority Ventures] (https://www.newmajorityventures.net)",
    "website at\n[https://www.newmajorityventures.net](https://www.newmajorityventures.net).",
    "website at\\n[https://www.newmajorityventures.net](https://www.newmajorityventures.net)."
];

function formatMessage(text) {
    if (!text) return text;
    // 1. Convert markdown links: [text](url) -> <a href="url" target="_blank">text</a>
    text = text.replace(/\[([^\]]+)\]\s*\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #22c55e; text-decoration: underline; font-weight: 500;">$1</a>');

    // 2. Handle "bare" URLs (e.g. https://google.com) not already converted
    text = text.replace(/(^|\s)(https?:\/\/[^\s<]+[^.,\s<])/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #22c55e; text-decoration: underline; font-weight: 500;">$2</a>');
    return text;
}

tests.forEach((t, i) => {
    console.log(`Test ${i}:`, t);
    console.log(`Result:`, formatMessage(t));
    console.log('---');
});
