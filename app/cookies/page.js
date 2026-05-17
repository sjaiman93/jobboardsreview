import { getSiteContent } from "@/data/siteContent";

export const metadata = {
  title: "Cookie Preferences | JobBoardsReview",
};

export default function CookiesPage() {
  const content = getSiteContent()?.legal?.cookies;

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 lg:py-32">
      <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-12">Cookie Preferences</h1>
      {content ? (
        <div className="prose-custom" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p className="text-xl text-slate-500 font-medium">Content will be added via admin panel</p>
      )}
    </div>
  );
}
