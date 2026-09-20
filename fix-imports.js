import fs from 'fs';
import path from 'path';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walkDir('D:/Casino/apps/web/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace gameTypes imports
  content = content.replace(/from\s+['"](?:\.\.\/)+types\/gameTypes['"]/g, "from '@hof/shared'");
  content = content.replace(/from\s+['"]\.\/types\/gameTypes['"]/g, "from '@hof/shared'");

  // Replace cardEngine imports
  content = content.replace(/from\s+['"](?:\.\.\/)+game\/cardEngine['"]/g, "from '@hof/game-engine'");
  content = content.replace(/from\s+['"]\.\/cardEngine['"]/g, "from '@hof/game-engine'");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in ${file}`);
  }
});
