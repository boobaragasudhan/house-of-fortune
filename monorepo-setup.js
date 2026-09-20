import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname);

function createDir(dir) {
  const fullPath = path.join(root, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created ${dir}`);
  }
}

function moveFileOrDir(src, dest) {
  const fullSrc = path.join(root, src);
  const fullDest = path.join(root, dest);
  if (fs.existsSync(fullSrc)) {
    try {
      // Use copy + remove to avoid Windows EPERM directory locks
      fs.cpSync(fullSrc, fullDest, { recursive: true });
      fs.rmSync(fullSrc, { recursive: true, force: true });
      console.log(`Moved ${src} to ${dest}`);
    } catch (e) {
      console.error(`Failed to move ${src}: ${e.message}`);
    }
  } else {
    console.log(`Skipped moving ${src} (not found)`);
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(root, filePath), JSON.stringify(data, null, 2));
  console.log(`Wrote ${filePath}`);
}

console.log('--- Starting Monorepo Migration ---');

// 1. Create directories
createDir('apps/web');
createDir('apps/server/src');
createDir('packages/shared/src');
createDir('packages/game-engine/src');
createDir('packages/database/prisma');

// 2. Move web app files
const webFiles = [
  'src', 'public', 'index.html', 'package.json', 'package-lock.json',
  'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json'
];

webFiles.forEach(f => moveFileOrDir(f, `apps/web/${f}`));

// 3. Move shared files from web to packages
moveFileOrDir('apps/web/src/types/gameTypes.ts', 'packages/shared/src/gameTypes.ts');
moveFileOrDir('apps/web/src/game/cardEngine.ts', 'packages/game-engine/src/cardEngine.ts');

// 4. Create root package.json
writeJson('package.json', {
  name: "house-of-fortune-monorepo",
  version: "1.0.0",
  private: true,
  workspaces: [
    "apps/*",
    "packages/*"
  ],
  scripts: {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present"
  }
});

// 5. Create packages package.jsons
writeJson('packages/shared/package.json', {
  name: "@hof/shared",
  version: "1.0.0",
  main: "src/gameTypes.ts",
  types: "src/gameTypes.ts"
});

writeJson('packages/game-engine/package.json', {
  name: "@hof/game-engine",
  version: "1.0.0",
  main: "src/cardEngine.ts",
  types: "src/cardEngine.ts",
  dependencies: {
    "@hof/shared": "*"
  }
});

writeJson('packages/database/package.json', {
  name: "@hof/database",
  version: "1.0.0",
  dependencies: {
    "@prisma/client": "^5.0.0"
  },
  devDependencies: {
    "prisma": "^5.0.0"
  }
});

// 6. Fix apps/web/package.json
const webPkgPath = path.join(root, 'apps/web/package.json');
if (fs.existsSync(webPkgPath)) {
  const webPkg = JSON.parse(fs.readFileSync(webPkgPath, 'utf8'));
  webPkg.name = "web";
  if (!webPkg.dependencies) webPkg.dependencies = {};
  webPkg.dependencies["@hof/shared"] = "*";
  webPkg.dependencies["@hof/game-engine"] = "*";
  fs.writeFileSync(webPkgPath, JSON.stringify(webPkg, null, 2));
  console.log('Updated apps/web/package.json');
}

console.log('--- Migration Complete ---');
console.log('Now run: npm install');
