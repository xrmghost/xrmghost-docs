import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getHowTos } from '../lib/how-to';

export async function GET(context: APIContext) {
  const howTos = (await getHowTos()).filter(
    (howTo) => new URL(howTo.url).pathname !== '/how-to/windows-smart-app-control/',
  );
  return rss({
    title: 'XrmGhost Docs — How-to guides',
    description: 'Task-focused guides for XrmGhost, newest first.',
    site: new URL('/how-to/', context.site!),
    items: howTos.map((howTo) => ({
      title: howTo.title,
      description: howTo.description,
      pubDate: howTo.date,
      link: howTo.url,
    })),
  });
}
