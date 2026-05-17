import Link from "next/link";
import { getBlogs } from "@/data/blogs";

export const metadata = {
  title: "Blog | JobBoardsReview",
  description: "Recruitment insights, hiring strategies, and data-driven analysis of job boards.",
};

export default function BlogIndexPage() {
  const allBlogs = getBlogs();
  const publishedBlogs = allBlogs.filter((b) => b.status === "published").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
      <div className="max-w-3xl mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-6">Recruitment Insights</h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed">
          Data-driven strategies, platform teardowns, and actionable advice to help you hire better talent.
        </p>
      </div>

      {publishedBlogs.length === 0 ? (
        <div className="text-slate-500 font-medium">No articles published yet. Check back soon.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedBlogs.map((blog) => (
            <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-300">
              {blog.image && (
                <div className="h-56 overflow-hidden bg-slate-100">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-8 flex flex-col flex-grow">
                <div className="text-xs font-bold text-[#FF5630] uppercase tracking-widest mb-3">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-[#FF5630] transition-colors">
                  {blog.title}
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-6 flex-grow">
                  {blog.description}
                </p>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read article <span className="text-[#FF5630]">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
