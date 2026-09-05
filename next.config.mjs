const nextConfig = {
  async redirects() {
    return [
      {
        source: '/job-board/:slug',
        destination: '/board/:slug',
        permanent: true,
      },
      {
        source: '/job-boards/:slug',
        destination: '/category/:slug',
        permanent: true,
      },
      {
        source: '/job-boards',
        destination: '/directory',
        permanent: true,
      },
      {
        source: '/submit-job-board',
        destination: '/claim-listing',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
