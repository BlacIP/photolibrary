/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  transpilePackages: ['photostudio-shared'],
  // Increase body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async rewrites() {
    const destination =
      process.env.NEXT_PUBLIC_API_REWRITE_DEST ||
      (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
        : 'https://photolibrary-api.vercel.app');

    return [
      {
        source: '/api/:path*',
        destination: `${destination.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
