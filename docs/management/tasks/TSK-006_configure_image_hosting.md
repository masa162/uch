# タスク詳細: TSK-006

**ID**: `TSK-006`
**タイトル**: 画像ホスティングの設定
**ステータス**: 未着手
**優先度**: 中

## 1. タスクの目的

旧プロジェクトで利用されていた画像ホスティングサービス「Cloudinary」の画像を、新プロジェクトでも表示できるように設定する。

## 2. 手順

`/Users/nakayamamasayuki/Documents/GitHub/uch/next.config.js` ファイルを以下のように修正してください。
`images`プロパティを`nextConfig`オブジェクトに追加します。

**修正前 (参考):**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // ... (webpack config)
};

module.exports = nextConfig;
```

**修正後:**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
```

## 3. 完了の定義

*   `next.config.js` が上記内容で更新されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに更新されていることを確認する。
