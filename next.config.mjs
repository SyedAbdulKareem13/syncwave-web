/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Album art for YouTube/remote sources is loaded via <img>; allow remote thumbnails.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
