import fs from 'fs';

const src = '/Users/divyyadav/.gemini/antigravity-ide/brain/72d6e3ab-b376-4025-b056-6ab543c7f06f/media__1783105641707.png';
const dest = '/Users/divyyadav/developer/HomeProjectHub/public/person-working.png';

try {
  const data = fs.readFileSync(src);
  fs.writeFileSync(dest, data);
  console.log('Success: Read and wrote asset to public/person-working.png');
} catch (err) {
  console.error('Error reading/writing asset:', err);
}
