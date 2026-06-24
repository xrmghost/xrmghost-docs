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
