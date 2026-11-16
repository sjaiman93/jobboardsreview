// Renders schema.org structured data as <script type="application/ld+json">.
// "<" is escaped so content can never close the script tag early.
//
// Do not add AggregateRating or Review data until real, verified reviews
// exist: rating markup without reviews behind it violates Google's policy.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const SITE_URL = "https://jobboardsreview.com";

export function breadcrumbs(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
