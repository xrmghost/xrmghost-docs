import { getCollection } from 'astro:content';

export interface HowToEntry {
  title: string;
  description: string | undefined;
  date: Date;
  url: string;
}

export async function getHowTos(): Promise<HowToEntry[]> {
  const site = import.meta.env.SITE;
  if (!site) {
    throw new Error('import.meta.env.SITE is undefined: set `site` in astro.config.mjs.');
  }
  const isProduction = import.meta.env.MODE === 'production';

  const entries = (await getCollection('docs')).filter(
    (entry) =>
      entry.id.startsWith('how-to/') &&
      entry.id !== 'how-to/index' &&
      !(isProduction && entry.data.draft === true),
  );

  const howTos = entries.map((entry) => {
    if (!entry.data.date) {
      throw new Error(`How-to entry "${entry.id}" has no frontmatter date.`);
    }
    return {
      id: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      date: entry.data.date,
      url: new URL(`/${entry.id}/`, site).href,
    };
  });

  howTos.sort((a, b) => b.date.getTime() - a.date.getTime() || a.id.localeCompare(b.id));

  return howTos.map(({ title, description, date, url }) => ({ title, description, date, url }));
}
