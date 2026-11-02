import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

// Confine di percorso, non prefisso lasco: "how-to" esatto oppure "how-to/...".
// Un id come "how-to-extra/x" non deve ricevere il feed.
function isHowToRoute(id: string): boolean {
  return id === 'how-to' || id.startsWith('how-to/');
}

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals;
  if (!isHowToRoute(starlightRoute.id)) return;

  const site = context.site;
  if (!site) {
    throw new Error('`site` is undefined: set it in astro.config.mjs.');
  }

  starlightRoute.head.push({
    tag: 'link',
    attrs: {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'XrmGhost how-to guides',
      href: new URL('/how-to/rss.xml', site).href,
    },
  });
});
