/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Railway / Docker deployment
  output: "standalone",
  // Allow larger audio file uploads (default is 4MB)
  api: {
    bodyParser: false, // We handle multipart parsing ourselves
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

module.exports = nextConfig;
