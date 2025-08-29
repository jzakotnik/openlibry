/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    return new Date().toLocaleDateString();
  },
  swcMinify: true,
  images: {
    minimumCacheTTL: 5,

    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ['@mui/x-data-grid']
};

module.exports = nextConfig;
