import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Data di prima pubblicazione, stabile: non e' un "ultimo aggiornamento".
        date: z.coerce.date().optional(),
      }),
    }),
  }),
};
