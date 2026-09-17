import { useEffect } from 'react';

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!meta) { meta = document.createElement('meta'); meta.setAttribute(attribute, name); document.head.appendChild(meta); }
  meta.content = content;
}

export function useDocumentMeta(title: string, description: string): void {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', `${window.location.origin}${window.location.pathname}`, 'property');
    setMeta('og:image', `${window.location.origin}/logo-apik.svg`, 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', `${window.location.origin}/logo-apik.svg`);
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}${window.location.pathname}`;
  }, [title, description]);
}
