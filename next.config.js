/** @type {import('next').NextConfig} */

// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  
  reactStrictMode: true,
  output: "standalone",
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    return new Date().toLocaleDateString();
  },
  images: {
    minimumCacheTTL: 0,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
 
};



module.exports = withBundleAnalyzer(nextConfig);
