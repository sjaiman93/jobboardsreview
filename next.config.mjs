/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/job-board/:slug',
        destination: '/board/:slug',
        permanent: true, // 301 redirect for SEO
      },
    ];
  },
};

export default nextConfig;
