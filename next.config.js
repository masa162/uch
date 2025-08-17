/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dockerビルド用にstandaloneモードを有効化
  output: 'standalone',

  // Next.jsの厳格モードを有効にします。開発中に潜在的な問題を検出するのに役立ちます。
  reactStrictMode: true,
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
  
  // Docker環境でファイルの変更を正しく検知するための設定
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
