/** @type {import('next').NextConfig} */
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

module.exports = nextConfig;
