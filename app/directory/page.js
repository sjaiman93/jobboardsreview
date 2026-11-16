import { getReviewStatsMap } from "@/lib/reviews";
import DirectoryClient from "./DirectoryClient";

// Board ratings come from approved reviews; refresh at least every 5 minutes.
export const revalidate = 300;

export default async function DirectoryPage() {
  return <DirectoryClient ratings={await getReviewStatsMap()} />;
}
