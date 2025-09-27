/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // API rewrites for standalone mode
  async rewrites() {
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
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, { isServer }) => {
    // Minimal webpack config for export mode
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      http: false,
      https: false,
      querystring: false,
    };

    // Exclude hls.js from server-side bundle to prevent SSR issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('hls.js');
    }

    return config;
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
