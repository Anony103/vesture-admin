import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const environment = env.VITE_APP_ENVIRONMENT ?? 'TEST';
  const targets: Record<string, string> = {
    TEST: env.VITE_APP_BASE_URL_TEST ?? 'http://localhost:8082',
    STAGING: env.VITE_APP_BASE_URL_STAGE ?? 'https://stage-api.myvesture.co',
    LIVE: env.VITE_APP_BASE_URL_LIVE ?? 'https://stage-api.myvesture.co',
    development: env.VITE_APP_BASE_URL_STAGE ?? 'https://stage-api.myvesture.co',
  };
  const target = targets[environment] ?? targets.TEST;

  // In dev the app calls same-origin paths (see baseUrl in src/constants) and the
  // dev server forwards them to the real API, so the browser never hits CORS.
  const proxy = Object.fromEntries(
    ['/api', '/asset', '/savings', '/user'].map((prefix) => [
      prefix,
      { target, changeOrigin: true, secure: true },
    ])
  );

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: { proxy },
  };
})
