const fs = require('fs');
const html = fs.readFileSync('form_new.html', 'utf8');

const match = html.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);\s*</s);
if (match && match[1]) {
    try {
        const data = JSON.parse(match[1]);
        const formItems = data[1][1];
        
        console.log("Extracted Fields:");
        formItems.forEach(item => {
            const title = item[1];
            // item[4] contains the input definitions
            if (item[4] && item[4][0]) {
                const entryId = item[4][0][0];
                console.log(`${title} -> entry.${entryId}`);
            }
        });
    } catch (e) {
        console.log("Error parsing JSON:", e.message);
    }
} else {
    console.log("Could not find FB_PUBLIC_LOAD_DATA_ block.");
}
