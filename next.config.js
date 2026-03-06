/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Railway / Docker deployment
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

module.exports = nextConfig;
