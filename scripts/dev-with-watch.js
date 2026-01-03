const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');

function run(command, args) {
  return spawn(command, args, { cwd: root, stdio: 'inherit', shell: true });
}

const watcher = run('pnpm', ['run', 'shared:watch']);
const dev = run('pnpm', ['run', 'dev:plain']);

function shutdown(code = 0) {
  if (!watcher.killed) {
    watcher.kill('SIGINT');
  }
  if (!dev.killed) {
    dev.kill('SIGINT');
  }
  process.exit(code);
}

dev.on('exit', (code) => shutdown(code ?? 0));
watcher.on('exit', (code) => {
  if (code && code !== 0) {
    shutdown(code);
  }
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
