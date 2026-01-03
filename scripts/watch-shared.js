const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const sharedPath = path.join(root, '..', 'photostudio-shared');
const sharedAdminDir = path.join(sharedPath, 'components', 'admin');
const nodeAdminDir = path.join(root, 'node_modules', 'photostudio-shared', 'components', 'admin');
const pkgPath = path.join(root, 'package.json');
const ignoredSegments = ['node_modules', '.git', '.next', 'dist', 'build'];
const relevantRoots = ['components', 'hooks', 'lib', 'utils', 'package.json', 'tailwind.config.ts'];
const cooldownMs = 2000;

function isLocalSharedDependency() {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const dep = pkg.dependencies && pkg.dependencies['photostudio-shared'];
    return typeof dep === 'string' && dep.startsWith('file:');
  } catch (err) {
    console.error('Failed to read package.json:', err);
    return false;
  }
}

function shouldIgnore(filePath) {
  if (!filePath) return false;
  return ignoredSegments.some((segment) => filePath.includes(`${path.sep}${segment}${path.sep}`) || filePath.startsWith(segment));
}

function isRelevantPath(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/');
  return relevantRoots.some((root) => normalized === root || normalized.startsWith(`${root}/`));
}

function runInstall() {
  if (isInstalling) return;

  isInstalling = true;
  const child = spawn('pnpm', ['install'], { cwd: root, stdio: 'inherit', shell: true });

  child.on('exit', (code) => {
    isInstalling = false;
    lastInstallEnd = Date.now();
    muteUntil = Date.now() + cooldownMs;
    if (code && code !== 0) {
      console.error(`pnpm install exited with code ${code}`);
    }
  });
}

if (!fs.existsSync(sharedPath)) {
  console.error(`Shared package not found at ${sharedPath}`);
  process.exit(1);
}

if (!isLocalSharedDependency()) {
  console.log('photostudio-shared is not set to a local file dependency. Exiting.');
  process.exit(0);
}

let debounceTimer = null;
let isInstalling = false;
let lastInstallEnd = 0;
let scheduledInstall = null;
let muteUntil = 0;

if (fs.existsSync(sharedAdminDir) && !fs.existsSync(nodeAdminDir)) {
  runInstall();
}

console.log(`Watching ${sharedPath} for changes...`);

fs.watch(sharedPath, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  if (shouldIgnore(filename)) return;
  if (!isRelevantPath(filename)) return;
  if (isInstalling) return;

  const now = Date.now();
  if (now < muteUntil) return;

  const cooldownRemaining = Math.max(0, cooldownMs - (now - lastInstallEnd));

  if (scheduledInstall) {
    clearTimeout(scheduledInstall);
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    scheduledInstall = setTimeout(() => {
      runInstall();
    }, cooldownRemaining);
  }, 200);
});
