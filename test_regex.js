function formatMessage(text) {
    if (!text) return '';
    text = text.replace(/\[([^\]]+)\]\s*\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    text = text.replace(/(^|\s)(https?:\/\/[^\s<]+[^.,\s<])/g, '$1<a href="$2" target="_blank">$2</a>');
    return text;
}
console.log(formatMessage("[https://www.newmajorityventures.net](https://www.newmajorityventures.net)."));
console.log(formatMessage("Yes, you can visit the New Majority Ventures website at [https://www.newmajorityventures.net](https://www.newmajorityventures.net). Here, you can find information..."));
