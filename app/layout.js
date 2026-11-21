import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { shareMetadata } from "@/lib/shareImage";
import JsonLd, { SITE_URL } from "@/components/JsonLd";

// sameAs is left out until social profile links appear in the footer.
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "JobBoardsReview",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "JobBoardsReview",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const SITE_TITLE = "JobBoardsReview | Compare & Review Job Boards";
const SITE_DESCRIPTION =
  "Stop burning recruitment budget on blind intuition. Access the definitive database of job board performance, cost, and candidate quality.";

export const metadata = {
  metadataBase: new URL("https://jobboardsreview.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  ...shareMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, url: "/" }),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" }
    ],
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      {/* data-jbr-site: marker for the launch-gate check in CLAUDE.md. Only
          this site has it, the old Lovable site doesn't. Don't remove. (A
          <meta> via `metadata.other` is dropped when ISR re-renders a page.) */}
      <body className="overflow-x-hidden" data-jbr-site="next">
        <JsonLd data={ORGANIZATION_LD} />
        <JsonLd data={WEBSITE_LD} />
        <div className="min-h-screen bg-[#FCFBF8]">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
