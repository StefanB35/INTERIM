/// <reference types="node" />

import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';

const repositoryRoot = resolve(__dirname, '..');
const iconDirectory = resolve(repositoryRoot, 'Cadrage/Charte-graphique/apik-icones');
const sourceRootFallback = resolve(repositoryRoot, 'Cadrage/Charte-graphique');
const outputRoot = resolve(repositoryRoot, 'apps/web/src/components/icons');
const spriteOutput = resolve(repositoryRoot, 'apps/web/public/icons.svg');
const brandAssets = new Set(['apik 1.svg', 'Group 3.svg', 'Group 4.svg', 'Group 5.svg', 'Group 6.svg', 'etincelle 2.svg']);
const brandComponentNames = new Map([['apik 1.svg', 'LogoApik']]);

type SvgAttribute = [string, string];

const attributeNames: Record<string, string> = {
  'aria-label': 'aria-label',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
};

function toComponentName(fileName: string): string {
  return fileName
    .replace(/\.svg$/i, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function parseAttributes(source: string): { tag: string; attributes: SvgAttribute[]; inner: string } {
  const match = source.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!match) throw new Error('Invalid SVG: missing svg root');
  const attributes: SvgAttribute[] = [];
  const attributePattern = /([:\w-]+)=(?:"([^"]*)"|'([^']*)')/g;
  for (const item of match[1].matchAll(attributePattern)) {
    const name = attributeNames[item[1]] ?? item[1];
    if (name !== 'class' && name !== 'xmlns' && name !== 'width' && name !== 'height' && name !== 'role' && name !== 'aria-label') {
      attributes.push([name, item[2] ?? item[3] ?? '']);
    }
  }
  return { tag: 'svg', attributes, inner: match[2].trim() };
}

function jsxInner(inner: string): string {
  return inner
    .replace(/<!--[^]*?-->/g, '')
    .replace(/\s([:\w-]+)=/g, (_match, name: string) => ` ${attributeNames[name] ?? name}=`)
    .replace(/=(["'])([^"']*)\1/g, (_match, quote: string, value: string) => `={${JSON.stringify(value)}}`)
    .replace(/<([a-z]+)([^>]*?)(\/)?>/gi, (_match, tag: string, attrs: string, selfClosing: string) => {
      const normalized = attrs.replace(/\s([:\w-]+)=/g, (_attrMatch: string, name: string) => ` ${attributeNames[name] ?? name}=`);
      return `<${tag}${normalized}${selfClosing ? ' />' : '>'}`;
    });
}

function componentSource(componentName: string, svg: string): string {
  const parsed = parseAttributes(svg);
  const rootAttributes = parsed.attributes
    .map(([name, value]) => `${name}={${JSON.stringify(value)}}`)
    .join(' ');
  return `import type { SVGProps } from 'react';\n\nexport type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };\n\nexport function ${componentName}({ size = 24, title, ...props }: IconProps) {\n  return (\n    <svg ${rootAttributes} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>\n      ${jsxInner(parsed.inner)}\n    </svg>\n  );\n}\n`;
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.name.endsWith('.svg')) files.push(path);
  }
  return files;
}

async function main() {
  let sourceRoot = iconDirectory;
  try {
    await access(sourceRoot);
  } catch {
    sourceRoot = sourceRootFallback;
  }
  const files = await walk(sourceRoot);
  const exports: string[] = [];
  const iconNames: string[] = [];
  const spriteSymbols: string[] = [];
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  for (const file of files) {
    const fileName = basename(file);
    if (brandAssets.has(fileName) && !brandComponentNames.has(fileName)) continue;
    const componentName = brandComponentNames.get(fileName) ?? toComponentName(fileName);
    const output = resolve(outputRoot, `${componentName}.tsx`);
    const source = await readFile(file, 'utf8');
    if (!/<svg(?:\s|>)/i.test(source)) {
      console.warn(`Skipped non-SVG asset: ${relative(process.cwd(), file)}`);
      continue;
    }
    await writeFile(output, componentSource(componentName, source), 'utf8');
    exports.push(`export { ${componentName} } from './${componentName}';`);
    iconNames.push(componentName);
    const parsed = parseAttributes(source);
    const viewBox = parsed.attributes.find(([name]) => name === 'viewBox')?.[1] ?? '0 0 24 24';
    spriteSymbols.push(`<symbol id="${componentName}" viewBox="${viewBox}">${parsed.inner}</symbol>`);
  }
  const sortedNames = iconNames.sort();
  await writeFile(resolve(outputRoot, 'index.ts'), `export type IconName = ${sortedNames.map((name) => `'${name}'`).join(' | ')};\n\n${exports.sort().join('\n')}\n`, 'utf8');
  await writeFile(spriteOutput, `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${spriteSymbols.sort().join('')}</defs></svg>\n`, 'utf8');
  console.log(`Generated ${sortedNames.length} icon components from ${relative(process.cwd(), sourceRoot)}.`);
}

void main();
