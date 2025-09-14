/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  optimizeFonts: false,
  async rewrites() {
    // Proxy NextAuth endpoints to the API server
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    return [
      {
        source: '/api/auth/:path*',
        destination: `${apiBase}/api/auth/:path*`,
      },
    ]
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },

  typescript: {
    ignoreBuildErrors: false,
  },
  
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
