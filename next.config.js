/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    return new Date().toLocaleDateString();
  },
  swcMinify: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    minimumCacheTTL: 5,

    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
