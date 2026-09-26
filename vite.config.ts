import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import syncHandler from './api/sync.ts';

function mongoDevApiPlugin(): Plugin {
  return {
    name: 'mongo-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/sync', async (req, res) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          if (body) {
            try {
              (req as any).body = JSON.parse(body);
            } catch {
              (req as any).body = {};
            }
          }
          // Wrap in Express/Connect compatible helpers if needed
          (res as any).status = function (code: number) {
            res.statusCode = code;
            return this;
          };
          (res as any).json = function (data: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return this;
          };
          try {
            await syncHandler(req, res);
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mongoDevApiPlugin()],
  server: {
    proxy: {
      '/api/verix': {
        target: 'https://verix-cyan.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/verix/, ''),
      },
    },
  },
});
