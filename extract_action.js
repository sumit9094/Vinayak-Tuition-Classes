const fs = require('fs');
const html = fs.readFileSync('form_new.html', 'utf8');

const match = html.match(/<form action="([^"]+)"/);
if (match && match[1]) {
    console.log("Action URL:", match[1]);
} else {
    console.log("No form action found.");
}
