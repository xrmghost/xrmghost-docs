<p align="center">
  <img src="./assets/XG_Audiowide_transparent_negative.svg" alt="XrmGhost" width="320" />
</p>

# xrmghost-docs

Pure MDX content repository for the XrmGhost documentation. This repo contains **only content** — no build toolchain, no framework, no `package.json`.

## Purpose

`xrmghost-docs` is a content-only repository that is consumed as a **git submodule** by [xrmghost-user-portal](https://github.com/xrmghost/xrmghost-user-portal). The portal is responsible for rendering the MDX files; this repo is responsible only for authoring and versioning the documentation content.

## Folder Structure

```
docs/
  getting-started.mdx        # First-run guide for new users
  cli/
    index.mdx                # CLI command reference
  attributes/
    index.mdx                # Attribute system reference
  architecture/
    index.mdx                # Internal architecture overview
  contributing/
    index.mdx                # Contribution guidelines
README.md
.gitignore
```

Additional product sections should be added as subdirectories under `docs/`, each containing at minimum an `index.mdx`.

## Frontmatter Contract

Every `.mdx` file **must** include a YAML frontmatter block. The following fields are **required**:

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Human-readable page title, used as the `<h1>` and `<title>` in the portal |
| `description` | `string` | Short summary (1–2 sentences) used in meta tags and search previews |

Example:

```yaml
---
title: Getting Started
description: A quick introduction to XrmGhost and how to get up and running for the first time.
---
```

Optional frontmatter fields (interpreted by the portal, not enforced here):

| Field | Type | Description |
|-------|------|-------------|
| `order` | `number` | Sort order within a sidebar section |
| `draft` | `boolean` | If `true`, the page is hidden in production builds |
| `tags` | `string[]` | Categorization tags for search |

## Consumption Contract

The portal consumes this repository as a git submodule mounted at `content/docs/`. It reads all `.mdx` files recursively, applies the frontmatter metadata, and renders the content using its own MDX pipeline.

**Do not** add any of the following to this repository:
- `package.json` or any Node.js tooling
- A static site generator (Astro, Next.js, Docusaurus, etc.)
- Build output directories (`dist/`, `.astro/`, `.next/`, etc.)
- `node_modules/`

All rendering concerns belong in `xrmghost-user-portal`.

## Architecture & Content Model

For documentation on how this repository is structured, where content ownership lives, and where auto-generated reference content will plug in, see [docs/architecture/](docs/architecture/index.mdx):

- [Source of Truth](docs/architecture/source-of-truth.mdx) — canonical content source and portal consumption model
- [Content Ownership](docs/architecture/content-ownership.mdx) — section-to-repo-and-team mapping and update process
- [Generated vs Manual](docs/architecture/generated-vs-manual.mdx) — rules around authored vs auto-generated content

## Contributing

See [docs/contributing/index.mdx](docs/contributing/index.mdx).
