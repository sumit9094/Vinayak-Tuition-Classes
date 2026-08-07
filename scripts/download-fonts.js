const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '..', 'src', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

function fetchCss() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'fonts.googleapis.com',
      path: '/css2?family=Noto+Sans+Gujarati:wght@400;700',
      headers: {
        // Older Safari User-Agent forces Google Fonts to return TTF format
        'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: Status ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  try {
    console.log('Fetching Google Fonts TTF CSS...');
    const css = await fetchCss();
    const urls = [];
    const regex = /url\((https:\/\/fonts\.gstatic\.com\/[^\)]+\.ttf)\)/g;
    let match;
    while ((match = regex.exec(css)) !== null) {
      urls.push(match[1]);
    }
    console.log('Found TTF font URLs:', urls);

    if (urls.length >= 1) {
      await downloadFile(urls[0], path.join(fontsDir, 'NotoSansGujarati-Regular.ttf'));
      console.log('Downloaded NotoSansGujarati-Regular.ttf');
    }
    if (urls.length >= 2) {
      await downloadFile(urls[1], path.join(fontsDir, 'NotoSansGujarati-Bold.ttf'));
      console.log('Downloaded NotoSansGujarati-Bold.ttf');
    } else if (urls.length === 1) {
      await downloadFile(urls[0], path.join(fontsDir, 'NotoSansGujarati-Bold.ttf'));
      console.log('Copied Regular to NotoSansGujarati-Bold.ttf');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
