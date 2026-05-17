import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogs, getBlogBySlug } from "@/data/blogs";
import ShareButtons from "@/components/ShareButtons";

export async function generateStaticParams() {
  const blogs = getBlogs();
  return blogs.filter((b) => b.status === "published").map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }) {
  const blog = getBlogBySlug(params.slug);
  if (!blog || blog.status !== "published") {
    return { title: "Post Not Found | JobBoardsReview" };
  }
  return {
    title: `${blog.metaTitle || blog.title} | JobBoardsReview`,
    description: blog.metaDescription || blog.description,
  };
}

export default function BlogPostPage({ params }) {
  const blog = getBlogBySlug(params.slug);

  if (!blog || blog.status !== "published") {
    notFound();
  }

  // Define full URL for sharing (assuming localhost or specific domain)
  // In a real app, this might come from env variables or headers.
  const shareUrl = `https://jobboardsreview.com/blog/${blog.slug}`;
  const shareText = encodeURIComponent(blog.title);
  const shareUrlEnc = encodeURIComponent(shareUrl);

  return (
    <article className="max-w-4xl mx-auto px-6 py-24 lg:py-32">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#FF5630] mb-12 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all posts
      </Link>

      <header className="mb-16 text-center max-w-3xl mx-auto">
        <div className="text-sm font-bold text-[#FF5630] uppercase tracking-widest mb-4">
          {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
          {blog.title}
        </h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed">
          {blog.description}
        </p>
      </header>

      {blog.image && (
        <div className="w-full h-[400px] md:h-[500px] rounded-[40px] overflow-hidden mb-16 bg-slate-100 shadow-2xl">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose-custom max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: blog.content }} />

      <hr className="my-16 border-slate-200" />

      {/* Share Section */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">Share this article</h3>
        <ShareButtons shareUrl={shareUrl} shareText={blog.title} />
      </div>
    </article>
  );
}
