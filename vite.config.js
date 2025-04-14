import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/lung-followup-app/', // <- matches your repo name
  plugins: [react()],
});

