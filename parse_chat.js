const fs = require('fs');
const html = fs.readFileSync('/Users/ashmitaeri/.gemini/antigravity-ide/brain/c6dab97a-516f-4904-ba12-95bba0ef3e7c/.system_generated/steps/92/content.md', 'utf8');
const match = html.match(/<script type="application\/json" id="client-bootstrap"[^>]*>([\s\S]*?)<\/script>/);
if (match && match[1]) {
  try {
    const data = JSON.parse(match[1]);
    // find messages
    // The structure might be deep, let's just JSON stringify and grep for message content, or recursively find "text" fields or "message" arrays.
    
    let chat = "";
    function traverse(obj) {
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
      } else if (typeof obj === 'object' && obj !== null) {
        if (obj.message && obj.message.content && obj.message.content.parts) {
           chat += "\n\nAUTHOR: " + (obj.message.author && obj.message.author.role) + "\n";
           chat += obj.message.content.parts.join("\n");
        }
        Object.values(obj).forEach(traverse);
      }
    }
    traverse(data);
    
    if(chat) {
        console.log(chat);
    } else {
        console.log("No messages found with standard structure. Dumping some keys...");
        console.log(Object.keys(data));
        // Maybe try another structure
        function traverse2(obj) {
            if (Array.isArray(obj)) obj.forEach(traverse2);
            else if (typeof obj === 'object' && obj !== null) {
                if (obj.parts && Array.isArray(obj.parts)) {
                    console.log("PARTS:", obj.parts.join(" "));
                }
                Object.values(obj).forEach(traverse2);
            }
        }
        traverse2(data);
    }
  } catch (e) {
    console.error("Error parsing JSON", e);
  }
} else {
  console.log("Could not find script tag");
}
