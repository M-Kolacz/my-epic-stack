import { type Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';
import radixPlugin from 'tailwindcss-radix';

export default {
	content: ['./app/**/*.{ts,tsx,jsx,js}'],
	darkMode: 'class',
	plugins: [animatePlugin, radixPlugin],
} satisfies Config;
