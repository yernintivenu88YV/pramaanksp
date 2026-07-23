import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const built = resolve(root, 'client');
const index = resolve(built, 'index.html');
const assets = resolve(built, 'assets');

function ensure(dir) {
  mkdirSync(dir, { recursive: true });
}

function copyIndex(target) {
  ensure(dirname(target));
  copyFileSync(index, target);
}

function copyAssets(target) {
  if (existsSync(assets)) {
    ensure(target);
    cpSync(assets, target, { recursive: true, force: true });
  }
}

copyIndex(resolve(root, 'index.html'));
copyIndex(resolve(root, 'app', 'index.html'));
copyIndex(resolve(root, 'appsail', 'static', 'index.html'));
copyIndex(resolve(root, 'appsail', 'static', 'app', 'index.html'));
copyAssets(resolve(root, 'assets'));
copyAssets(resolve(root, 'appsail', 'static', 'assets'));
console.log('Synced frontend build to root, app/, and appsail/static.');
