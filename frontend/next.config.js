/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',               // ⬅️ static export
  images: { unoptimized: true },  // (optional) to avoid next/image optimization on static
};
module.exports = nextConfig;
