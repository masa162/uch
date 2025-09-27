/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,

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
