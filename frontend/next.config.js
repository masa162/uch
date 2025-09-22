/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  
  async rewrites() {
    // Proxy API endpoints to the API server
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
    return [
      {
        source: '/api/auth/:path*',
        destination: `${apiBase}/api/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
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
    // Add fallback for 'crypto' module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      http: false,
      https: false,
      querystring: false,
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
