// Hosts allowed for remote cover images. Shared with the admin validation
// (src/lib/utils/validate.ts) so a cover can never be accepted there and then
// crash next/image on the public pages.
const { remoteImageHosts } = require("./src/lib/mediaHosts.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: remoteImageHosts.map((hostname) => ({
      protocol: "https",
      hostname
    }))
  }
};

module.exports = nextConfig;

