// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.xrmghost.tech',
	integrations: [
		starlight({
			title: 'XrmGhost Docs',
			logo: {
				src: '/assets/XG_Audiowide_transparent.svg',
				replacesTitle: true
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/xrmghost/xrmghost' },
			],
			customCss: ['./src/styles/custom.css'],
			components: {
				// Adds the approved first-party backlink mesh to every docs page
				// footer (AB#1683). See src/components/Footer.astro.
				Footer: './src/components/Footer.astro',
			},
			head: [
				// Docs-level entity metadata (AB#1683). sameAs lists only
				// first-party, public, non-gated XrmGhost surfaces —
				// admin.xrmghost.tech is intentionally excluded.
				{
					tag: 'script',
					attrs: { type: 'application/ld+json' },
					content: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'WebSite',
						name: 'XrmGhost Documentation',
						url: 'https://docs.xrmghost.tech',
						description:
							'Official documentation for the XrmGhost framework: local-first development for Microsoft Dataverse and Dynamics 365.',
						isPartOf: {
							'@type': 'Organization',
							name: 'XrmGhost',
							url: 'https://www.xrmghost.tech',
							sameAs: [
								'https://www.xrmghost.tech',
								'https://github.com/xrmghost',
								'https://github.com/xrmghost/xrmghost',
								'https://github.com/xrmghost/xrmghost-skills',
								'https://github.com/xrmghost/xrmghost-attributes',
								'https://www.nuget.org/packages/XrmGhost.Cli',
								'https://www.nuget.org/packages/XrmGhost.Attributes',
								'https://github.com/xrmghost/xrmghost-docs',
							],
						},
					}),
				},
			],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'Overview', slug: 'overview' },
						{ label: 'How It Works', slug: 'how-it-works' },
						{ label: 'Editions', slug: 'editions' },
					],
				},
				{ label: 'Getting Started', slug: 'getting-started' },
				{
					label: 'Skills',
					collapsed: true,
					items: [{ autogenerate: { directory: 'skills' } }],
				},
				{
					label: 'CLI',
					collapsed: true,
					items: [{ autogenerate: { directory: 'cli' } }],
				},
				{
					label: 'Attributes',
					collapsed: true,
					items: [{ autogenerate: { directory: 'attributes' } }],
				},
				{
					label: 'Architecture',
					collapsed: true,
					items: [{ autogenerate: { directory: 'architecture' } }],
				},
				{
					label: 'Community',
					collapsed: true,
					items: [{ autogenerate: { directory: 'community' } }],
				},
				{
					label: 'Contributing',
					collapsed: true,
					items: [{ autogenerate: { directory: 'contributing' } }],
				},
			],
		}),
	],
});
