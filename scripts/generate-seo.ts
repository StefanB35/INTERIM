/// <reference types="node" />

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const repositoryRoot = resolve(__dirname, '..');
const publicRoot = resolve(repositoryRoot, 'apps/web/public');
const siteUrl = process.env.VITE_PUBLIC_SITE_URL ?? 'https://apik.example';
const urls = ['/', '/missions/animateur-periscolaire-jeudi-soir-jacques-prevert', '/confidentialite', '/cgu'];

async function main() {
	await mkdir(publicRoot, { recursive: true });
	await writeFile(resolve(publicRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${siteUrl}${url}</loc></url>`).join('\n')}\n</urlset>\n`, 'utf8');
	await writeFile(resolve(publicRoot, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, 'utf8');
	console.log(`Generated SEO files for ${siteUrl}.`);
}

void main();