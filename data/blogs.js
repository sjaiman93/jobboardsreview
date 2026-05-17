export const blogs = [
  {
    "title": "",
    "slug": "",
    "description": "",
    "content": "<p><br></p>",
    "image": "",
    "metaTitle": "",
    "metaDescription": "",
    "status": "draft",
    "createdAt": "2026-05-01T17:56:40.806Z"
  }
];

export function getBlogs() {
  return blogs;
}

export function getBlogBySlug(slug) {
  return blogs.find((b) => b.slug === slug);
}
