// Guarantee NODE_ENV=production so Next.js never triggers development fallback error pages
process.env.NODE_ENV = 'production';

const { spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';
const npx = isWindows ? 'npx.cmd' : 'npx';

// 1. Ensure Prisma client is generated for the deployment environment
console.log('[build.js] Generating Prisma Client...');
try {
  spawnSync(npx, ['prisma', 'generate'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });
} catch (err) {
  console.warn('[build.js] Prisma generate non-fatal warning:', err.message);
}

// 2. Build Next.js
console.log('[build.js] Running Next.js production build...');
const res = spawnSync(npx, ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
});

process.exit(res.status ?? 0);
