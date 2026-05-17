import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "JobBoardsReview | Compare & Review Job Boards",
  description:
    "Stop burning recruitment budget on blind intuition. Access the definitive database of job board performance, cost, and candidate quality.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#FCFBF8]">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
