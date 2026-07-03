import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, StaleWhileRevalidate, CacheFirst, BackgroundSyncPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

// Background sync untuk request offline (Free Tier friendly)
const bgSyncPlugin = new BackgroundSyncPlugin('offline-mutations-queue', {
  maxRetentionTime: 24 * 60 // Coba kirim ulang hingga 24 jam
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. Supabase API Data - Stale While Revalidate
    {
      matcher: ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/rest/v1/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'supabase-api-cache',
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Pastikan hanya cache response sukses
              return response && response.status === 200 ? response : null;
            }
          }
        ]
      })
    },
    // 2. Static Assets (Images) - Cache First
    {
      matcher: ({ request }) => request.destination === 'image',
      handler: new CacheFirst({
        cacheName: 'images-cache',
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => response && response.status === 200 ? response : null,
          }
        ]
      })
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
