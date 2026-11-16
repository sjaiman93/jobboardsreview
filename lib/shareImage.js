// Default image for link previews (Open Graph / Twitter cards).
// public/og-image.png is a 1200x630 banner made in Canva
// ("JobBoardsReview link-preview banner"). To change it, replace that file
// and keep the size below in sync.
export const DEFAULT_SHARE_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "JobBoardsReview — Compare & Review Job Boards",
};

export const TWITTER_CARD = "summary_large_image";

export const SITE_NAME = "JobBoardsReview";

// Next.js replaces (does not merge) a parent's openGraph/twitter objects,
// so every page that sets its own must pass the full set of fields.
// `canonical: true` also sets a self-referencing canonical at `url`. Leave it
// off in the root layout: children inherit it and would all point at "/".
export function shareMetadata({ title, description, url, images, type = "website", extra = {}, canonical = false }) {
  const imgs = images && images.length ? images : [DEFAULT_SHARE_IMAGE];
  return {
    ...(canonical ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: imgs,
      locale: "en_US",
      type,
      ...extra,
    },
    twitter: {
      card: images && images.length ? "summary_large_image" : TWITTER_CARD,
      title,
      description,
      images: imgs.map((i) => i.url),
    },
  };
}
