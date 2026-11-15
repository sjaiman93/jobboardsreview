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
      },
      {
        source: '/board/stack-overflow-jobs',
        destination: '/category/technology',
        permanent: true,
      },
      // Boards removed in the Nov 2026 cleanup batch -> their category page
      { source: '/board/new-scientist-jobs', destination: '/category/science-research', permanent: true },
      { source: '/board/edsurge-jobs', destination: '/category/education', permanent: true },
      { source: '/board/careervitals', destination: '/category/healthcare', permanent: true },
      { source: '/board/crunchboard', destination: '/category/startups', permanent: true },
      { source: '/board/logistics-management-jobs', destination: '/category/logistics-supply', permanent: true },
      { source: '/board/hired', destination: '/category/technology', permanent: true },
      { source: '/board/nursingjobs', destination: '/category/healthcare', permanent: true },
      { source: '/board/chronicle-vitae', destination: '/category/education', permanent: true }
    ];
  },
};

export default nextConfig;
