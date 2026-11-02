import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getHowTos } from '../../lib/how-to';

export async function GET(context: APIContext) {
  const howTos = await getHowTos();
  return rss({
    title: 'XrmGhost how-to guides',
    description: 'Task-focused guides for XrmGhost, newest first.',
    site: context.site!,
    items: howTos.map((howTo) => ({
      title: howTo.title,
      description: howTo.description,
      pubDate: howTo.date,
      link: howTo.url,
    })),
  });
}
