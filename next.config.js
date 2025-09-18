/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for Korean product photos
  images: {
    domains: [
      'supabase.co',
      'your-supabase-project.supabase.co',
      'images.unsplash.com', // If using Unsplash for sample images
      'cdn.shopify.com', // If integrating with Korean brands' Shopify stores
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Internationalization for Korean language support
  i18n: {
    locales: ['en', 'ko'],
    defaultLocale: 'en',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // Rewrites for Korean brand pages
  async rewrites() {
    return [
      {
        source: '/korean-brands/:slug',
        destination: '/brands/:slug',
      },
      {
        source: '/k-beauty/:path*',
        destination: '/products/beauty/:path*',
      },
      {
        source: '/k-fashion/:path*',
        destination: '/products/fashion/:path*',
      },
    ]
  },
}

module.exports = {
  images: {
    domains: ['cdn.kiss-magazine.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
};