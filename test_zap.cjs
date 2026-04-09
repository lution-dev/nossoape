const fs = require('fs');
const html = fs.readFileSync('zap_test2.html', 'utf16le');

// Try fixing JSON-LD extraction
const jsonLdImgMatch = html.match(/"image"\s*:\s*(?:\[\s*"([^"]+)"|"\s*([^"]+)\s*")/i);
const jsonLdImg = jsonLdImgMatch?.[1] || jsonLdImgMatch?.[2];

console.log("JSON-LD Match:", jsonLdImg);

const allJsonImages = html.match(/"image"\s*:\s*\[[\s\S]*?\]/g);
console.log("All JSON-LD arrays:", allJsonImages ? allJsonImages[0].substring(0, 200) : null);
