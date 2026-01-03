const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkgPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(pkgPath)) {
  process.exit(0);
}

const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw);
const dep = pkg.dependencies?.['photostudio-shared'] || pkg.devDependencies?.['photostudio-shared'];

if (!dep) {
  process.exit(0);
}

const isLocal = dep.startsWith('file:');
const isGithub = dep.startsWith('github:');

if (isLocal) {
  console.log('photostudio-shared is local. Switching to GitHub before commit...');
  execSync('pnpm run shared:github', { stdio: 'inherit' });
} else if (isGithub) {
  console.log('photostudio-shared is GitHub. Refreshing lockfile before commit...');
  execSync('pnpm update photostudio-shared', { stdio: 'inherit' });
}

if (isLocal || isGithub) {
  if (fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) {
    execSync('git add package.json pnpm-lock.yaml', { stdio: 'inherit' });
  } else {
    execSync('git add package.json', { stdio: 'inherit' });
  }
}
