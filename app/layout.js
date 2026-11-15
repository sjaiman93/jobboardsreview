import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { shareMetadata } from "@/lib/shareImage";

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
      <body className="overflow-x-hidden">
        <div className="min-h-screen bg-[#FCFBF8]">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
