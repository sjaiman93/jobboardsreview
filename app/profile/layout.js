export const metadata = {
  title: "Your Profile | JobBoardsReview",
  // Personal, signed-in page: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }) {
  return children;
}
