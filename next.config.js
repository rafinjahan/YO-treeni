/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: '.' // Silences workspace mult-lockfile warnings inside production cloud compilation
    }
  }
};

module.exports = nextConfig;
