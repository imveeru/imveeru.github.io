import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const html = await readFile(path.join(dist, 'index.html'), 'utf8');

// Verify the artifact that Pages serves, not only the editable source.
for (const name of await readdir(dist, { recursive: true })) {
  if (!(await stat(path.join(dist, name))).isFile()) continue;
  assert.deepEqual(await readFile(path.join(root, name)), await readFile(path.join(dist, name)), `Published file differs: ${name}`);
}
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(https?:|data:|#)/.test(url)) continue;
  await stat(path.join(dist, url.replace(/^\//, '')));
}
for (const name of await readdir(path.join(dist, 'assets'))) {
  if (!name.endsWith('.css')) continue;
  const css = await readFile(path.join(dist, 'assets', name), 'utf8');
  for (const [, doubleQuoted, singleQuoted, unquoted] of css.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g)) {
    const url = doubleQuoted ?? singleQuoted ?? unquoted.trim();
    if (/^(https?:|data:)/.test(url)) continue;
    await stat(url.startsWith('/') ? path.join(dist, url.slice(1)) : path.resolve(dist, 'assets', url));
  }
}
const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
assert.equal(canonical, 'https://veeramanohar.in/');
assert.ok((await readFile(path.join(dist, 'sitemap.xml'), 'utf8')).includes(`<loc>${canonical}</loc>`));
assert.ok((await readFile(path.join(dist, 'robots.txt'), 'utf8')).includes(`${canonical}sitemap.xml`));
assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema.mainEntity.name, 'Veeramanohar');
const image = await readFile(path.join(dist, 'social-preview.png'));
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
console.log('Verified published files, local assets, heading, schema, canonical URL, sitemap, robots, and social image.');
