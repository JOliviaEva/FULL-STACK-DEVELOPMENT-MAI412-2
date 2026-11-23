import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api is proxied to the Express server so the React code never hardcodes a host.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
