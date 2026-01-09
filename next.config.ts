import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Turbopack config (Next.js 16+ default)
  turbopack: {
    resolveAlias: {
      // Polyfill node modules for browser
      fs: { browser: "./src/polyfills/empty.js" },
      path: { browser: "./src/polyfills/empty.js" },
      crypto: { browser: "./src/polyfills/empty.js" },
    },
  },
  // Webpack fallback (if using --webpack flag)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
