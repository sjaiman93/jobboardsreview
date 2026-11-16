const nextConfig = {
  async redirects() {
    return [
      // Old Lovable-site addresses whose paths differ on the new site.
      // Checked against all 126 URLs in the old sitemap (Nov 2026).
      // These must stay above the generic /job-board(s)/:slug rules below.
      { source: '/job-boards/technology-engineering', destination: '/category/technology', permanent: true },
      { source: '/job-boards/creative-media', destination: '/category/creative-design', permanent: true },
      { source: '/job-boards/finance-accounting', destination: '/category/finance', permanent: true },
      { source: '/job-boards/general', destination: '/category/generalist', permanent: true },
      { source: '/job-boards/logistics-supply-chain', destination: '/category/logistics-supply', permanent: true },
      { source: '/job-boards/nonprofit-government', destination: '/category/nonprofit-impact', permanent: true },
      { source: '/job-boards/remote-flexible-work', destination: '/category/remote-flexible', permanent: true },
      { source: '/job-boards/startups-tech', destination: '/category/startups', permanent: true },
      { source: '/job-boards/security-government-clearance', destination: '/category/generalist', permanent: true },
      { source: '/job-boards/sports-hospitality-retail', destination: '/category/generalist', permanent: true },
      { source: '/job-board/:slug/review', destination: '/board/:slug', permanent: true },
      { source: '/compare/:pair', destination: '/compare', permanent: true },
      { source: '/my-reviews', destination: '/profile', permanent: true },
      { source: '/contact', destination: '/about', permanent: true },
      { source: '/unsubscribe', destination: '/', permanent: true },
      { source: '/reset-password', destination: '/', permanent: true },
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
      { source: '/board/chronicle-vitae', destination: '/category/education', permanent: true },
      { source: '/board/lawyer-com-jobs', destination: '/category/legal', permanent: true }
    ];
  },
};

export default nextConfig;
