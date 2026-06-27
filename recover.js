const fs = require('fs');
const logPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\cc4331b0-5b69-4f93-bc90-f67258166d22\\.system_generated\\logs\\overview.txt';

if (fs.existsSync(logPath)) {
    const logData = fs.readFileSync(logPath, 'utf8');
    const lines = logData.split('\n');
    let lastReviewsStart = -1;
    let inReviews = false;
    let reviewsCode = [];
    
    // Simple extraction logic: search for the latest full block of Reviews.tsx
    // The easiest is just searching for the last `view_file` output for Reviews.tsx
    const viewFileStr = 'File Path: `file:///c:/Users/Admin/Desktop/Vinayak%20Tuition%20Classes/src/components/sections/Reviews.tsx`';
    
    const lastIndex = logData.lastIndexOf(viewFileStr);
    if (lastIndex !== -1) {
        const subLog = logData.substring(lastIndex);
        const endOfBlock = subLog.indexOf('The above content shows the entire, complete file contents');
        if (endOfBlock !== -1) {
            let codeLines = subLog.substring(0, endOfBlock).split('\n');
            // Remove the metadata lines and line numbers
            let cleanCode = codeLines.slice(4).map(line => {
                const colonIdx = line.indexOf(': ');
                if (colonIdx !== -1 && colonIdx < 10) {
                    return line.substring(colonIdx + 2);
                }
                return line;
            }).join('\n');
            
            fs.writeFileSync('src/components/sections/Reviews.tsx', cleanCode.trim() + '\n');
            console.log("Successfully recovered Reviews.tsx from view_file log!");
        } else {
             console.log("Found view_file string but no end block.");
        }
    } else {
        console.log("Could not find view_file log for Reviews.tsx");
    }
} else {
    console.log("Log file not found");
}
