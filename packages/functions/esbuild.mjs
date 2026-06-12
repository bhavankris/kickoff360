/**
 * Build + assemble the deploy artifact.
 *
 * Cloud Build runs plain `npm install` on the uploaded source, which can't
 * resolve `workspace:*` — so @repo/core (and zod) are compiled INTO lib/ and
 * deployment happens from `.deploy/`: the bundle plus a minimal package.json
 * whose dependencies are exactly the bundle's externals. firebase.json points
 * `functions.source` there (deploy AND emulator/functions:shell).
 *
 * Two entry points so local scripts keep working:
 *   src/index.ts        → lib/index.js        (the deployed functions)
 *   src/lib/project.ts  → lib/lib/project.js  (used by scripts/reproject.mjs)
 */
import { build } from 'esbuild';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const EXTERNALS = ['firebase-admin', 'firebase-functions', 'undici'];

await build({
  entryPoints: ['src/index.ts', 'src/lib/project.ts'],
  outdir: 'lib',
  outbase: 'src',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  sourcemap: true,
  external: EXTERNALS,
  logLevel: 'info',
});

// ── assemble .deploy ─────────────────────────────────────────────────
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
rmSync('.deploy', { recursive: true, force: true });
mkdirSync('.deploy');
cpSync('lib', '.deploy/lib', { recursive: true });
writeFileSync(
  '.deploy/package.json',
  JSON.stringify(
    {
      name: 'kickoff360-functions',
      version: pkg.version,
      private: true,
      engines: pkg.engines,
      main: 'lib/index.js',
      dependencies: Object.fromEntries(EXTERNALS.map((d) => [d, pkg.dependencies[d]])),
    },
    null,
    2,
  ) + '\n',
);
// the emulator / functions:shell read secrets from the source dir
if (existsSync('.secret.local')) cpSync('.secret.local', '.deploy/.secret.local');
console.log('assembled .deploy (lib + minimal package.json)');
