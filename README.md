<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/XG_Audiowide_transparent_negative.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/XG_Audiowide_transparent.svg">
    <img alt="Xrm Ghost" src="./assets/XG_Audiowide_transparent_negative.svg" width="300">
  </picture>
</p>

# xrmghost-docs

Repository for the public XrmGhost documentation site, published at [docs.xrmghost.tech](https://docs.xrmghost.tech).

## Tech Stack

- Built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).
- Published to GitHub Pages through GitHub Actions.
- Content is authored in MDX and validated through the Starlight docs collection schema.

## Repository Layout

The documentation content now lives inside the Astro project structure required by Starlight.

```text
assets/
  XG_Audiowide_transparent_negative.svg
public/
  favicon.svg
src/
  assets/                    # assets imported by Astro or referenced by docs pages
  content/
    docs/                    # canonical MDX content root
      index.mdx
      getting-started.mdx
      architecture/
      attributes/
      cli/
      contributing/
  content.config.ts          # Astro content collections and schema binding
  styles/
    custom.css               # Starlight theme overrides
astro.config.mjs
package.json
package-lock.json
tsconfig.json
README.md
```

New documentation areas should be added under `src/content/docs/`. Each section should have an `index.mdx` plus any child pages or nested folders required by the information architecture.

## Development

Install dependencies and run the site locally with the standard Astro commands.

```bash
npm install
npm run dev      # starts the dev server on http://localhost:4321
npm run build    # builds the production site into dist/
npm run preview  # previews the production build locally
```

## Deployment

The deployment target is GitHub Pages on pushes to `dev`, with `.github/workflows/deploy.yml` as the expected repository workflow entry point.

The public site is served from `https://docs.xrmghost.tech`. The custom domain should be kept aligned through a DNS CNAME record and the repository `public/CNAME` file.

## Frontmatter Contract

Every MDX page in `src/content/docs/` must start with YAML frontmatter.

The current content collection is bound to Starlight's standard `docsSchema()` in `src/content.config.ts`. At the repository level, the required authoring contract remains:

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Reader-facing page title used by Starlight in page and navigation metadata |
| `description` | `string` | Short summary used for metadata, previews, and section discovery |

Example:

```yaml
---
title: Getting Started
description: A quick introduction to XrmGhost and how to get up and running for the first time.
---
```

Optional fields currently recognised by the repository content contract are:

| Field | Type | Description |
|-------|------|-------------|
| `order` | `number` | Intended page order within a section when explicit ordering is needed |
| `draft` | `boolean` | Marks a page as non-public work in progress |
| `tags` | `string[]` | Free-form categorisation metadata for future discovery or automation |

If the Starlight schema is extended with custom fields in the future, document the additions here and keep the examples aligned with the implementation in `src/content.config.ts`.

## Content Architecture

The architecture notes describe the documentation operating model and the split between canonical authored content and future generated reference material.

- [Architecture Overview](src/content/docs/architecture/index.mdx)
- [Source of Truth](src/content/docs/architecture/source-of-truth.mdx)
- [Content Ownership](src/content/docs/architecture/content-ownership.mdx)
- [Generated vs Manual Content](src/content/docs/architecture/generated-vs-manual.mdx)

## Contributing

Start with [src/content/docs/contributing/index.mdx](src/content/docs/contributing/index.mdx).

For the end-to-end page authoring workflow, naming rules, and ownership guidance, see [src/content/docs/contributing/public-docs-workflow.mdx](src/content/docs/contributing/public-docs-workflow.mdx).
