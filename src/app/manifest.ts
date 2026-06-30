import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HUT ke-16 Pelkat PKLU GPIB',
    short_name: 'HUT 16 PKLU',
    description: 'Aplikasi Proposal dan Informasi HUT ke-16 Pelkat PKLU GPIB - Teruskan Baktimu!',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFBF7',
    theme_color: '#047857',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon_apps.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon_apps.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
