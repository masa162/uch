/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  
  // Note: rewrites are not supported in export mode
  
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
