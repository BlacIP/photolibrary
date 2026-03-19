import type { Config } from 'tailwindcss';
import sharedConfig from 'photostudio-shared/tailwind.config';

const config = {
  ...sharedConfig,
  content: [
    ...(Array.isArray(sharedConfig.content) ? sharedConfig.content : []),
    '../photostudio-shared/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/photostudio-shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
} satisfies Config;

export default config;
