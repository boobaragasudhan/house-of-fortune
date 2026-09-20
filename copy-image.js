import fs from 'fs';
import path from 'path';

const source = 'C:/Users/pooba/.gemini/antigravity-ide/brain/5c8d8a19-e07b-4bf5-92a1-d53b2f070cfd/casino_palace_intro_1789852398028.jpg';
const dest = 'D:/Casino/apps/web/public/casino_palace_intro.jpg';

fs.copyFileSync(source, dest);
console.log('Copied background image');
