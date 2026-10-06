import { cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);

// Keep the repository root ready for the existing GitHub Pages branch setup.
// Retain old hashed assets so visitors with cached HTML can finish loading.
for (const name of await readdir(dist)) {
  await cp(fileURLToPath(new URL(name, dist)), fileURLToPath(new URL(name, root)), { recursive: true });
}
console.log('Copied the production build to the GitHub Pages root.');
