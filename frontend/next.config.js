/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    REACT_APP_CLUSTER: process.env.REACT_APP_CLUSTER,
  },
  images: {
    domains: [
      'static.thenounproject.com',
      'encrypted-tbn0.gstatic.com',
      'avatars.dicebear.com',
      'png.pngtree.com',
    ],
  },
}

module.exports = nextConfig
