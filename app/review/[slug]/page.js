import { notFound } from "next/navigation";
import { getAllBoards, getBoardBySlug } from "@/data/jobBoards";
import { getApprovedReviews } from "@/lib/reviews";
import { listingTypeOf } from "@/lib/reviewFlow";
import ReviewFlow from "@/components/review-flow/ReviewFlow";

// The review form. Never indexed (framework section 5).
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const board = getBoardBySlug(slug);
  if (!board) return {};
  return {
    title: `Review ${board.name} | JobBoardsReview`,
    description: `Share how ${board.name} works for your recruiting team. About 2 minutes, no typing needed.`,
    robots: { index: false, follow: true },
  };
}

const SOURCES = new Set(["personal", "voucher", "vendor"]);

export default async function ReviewPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const board = getBoardBySlug(slug);
  if (!board) notFound();

  const one = (v) => (Array.isArray(v) ? v[0] : v) || "";
  const voucher = one(sp.campaign) === "voucher";
  const src = voucher ? "voucher" : SOURCES.has(one(sp.src)) ? one(sp.src) : "personal";
  // Local testing only: ?type=ai_tool shows the AI-tool questions on any board.
  const devType = process.env.NODE_ENV === "development" && one(sp.type) === "ai_tool" ? "ai_tool" : null;

  const reviewCount = (await getApprovedReviews(board.name)).length;

  // For "Review another board": healthcare listings first, then the rest.
  const others = getAllBoards()
    .filter((b) => b.slug !== board.slug)
    .map((b) => ({ slug: b.slug, name: b.name, healthcare: b.categorySlug === "healthcare" }))
    .sort((a, b) => Number(b.healthcare) - Number(a.healthcare) || a.name.localeCompare(b.name));

  return (
    <ReviewFlow
      board={{ slug: board.slug, name: board.name }}
      listingType={devType || listingTypeOf(board)}
      devListingType={devType}
      reviewCount={reviewCount}
      src={src}
      inviteRef={one(sp.ref).slice(0, 100)}
      voucher={voucher}
      again={one(sp.again) === "1"}
      otherBoards={others}
    />
  );
}
