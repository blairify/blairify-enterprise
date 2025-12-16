// tailwind.config.js
module.exports = {
	content: [
		// All of your Next.js pages/components:
		'./src/**/*.{js,jsx,ts,tsx}',

		// Also any story files:
		'./.storybook/**/*.{js,jsx,ts,tsx}',
		'./src/**/*.stories.@(js|jsx|ts|tsx)',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-ibm-plex)', 'IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				serif: ['var(--font-cinzel)', 'Cinzel', 'ui-serif', 'serif'],
				mono: ['var(--font-ibm-plex)', 'IBM Plex Sans', 'monospace'],
			},
		},
	},

	plugins: [],
};
