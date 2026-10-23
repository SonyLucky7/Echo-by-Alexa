// Guarantee NODE_ENV=production so Next.js never triggers development fallback error pages
process.env.NODE_ENV = 'production';

const { spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';
const cmd = isWindows ? 'npx.cmd' : 'npx';

const res = spawnSync(cmd, ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
});

process.exit(res.status ?? 0);
