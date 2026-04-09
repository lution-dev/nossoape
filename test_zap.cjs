const fs = require('fs');
const html = fs.readFileSync('zap_test2.html', 'utf16le');

// Try fixing JSON-LD extraction
const jsonLdImgMatch = html.match(/"image"\s*:\s*(?:\[\s*"([^"]+)"|"\s*([^"]+)\s*")/i);
const jsonLdImg = jsonLdImgMatch?.[1] || jsonLdImgMatch?.[2];

console.log("JSON-LD Match exact text block:", jsonLdImg);
console.log("Contains spaces?", jsonLdImg.includes(' '));
console.log("Contains unicode sequences?", jsonLdImg.includes('\\u'));
