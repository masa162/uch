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

  webpack: (config) => {
    // Minimal webpack config for export mode
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
    ignoreBuildErrors: true,
  },

  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
