const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const targets = {
  local: 'file:../photostudio-shared',
  github: 'github:BlacIP/photostudio-shared#main',
};

if (!targets[mode]) {
  console.error('Usage: node scripts/use-shared.js <local|github>');
  process.exit(1);
}

const pkgPath = path.join(process.cwd(), 'package.json');
const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw);

pkg.dependencies = pkg.dependencies || {};
const current = pkg.dependencies['photostudio-shared'];
const nextValue = targets[mode];
const shouldInstall = current !== nextValue;
pkg.dependencies['photostudio-shared'] = nextValue;

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`photostudio-shared set to ${nextValue}`);

if (shouldInstall) {
  console.log('Dependency changed. Running pnpm install...');
  require('child_process').execSync('pnpm install', { stdio: 'inherit' });
}
