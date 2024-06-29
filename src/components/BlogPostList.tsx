import BlogPostItem from "@/components/BlogPostItem";
import { BLOG_BY_SLUG_QUERYResult, BlogPost } from "@/types/sanity.types";

export default function BlogPostList(props: {
  posts: BLOG_BY_SLUG_QUERYResult[];
  className?: string;
}) {
  const { posts, className } = props ?? {};

  if (!posts || posts.length === 0) return null;

  return (
    <section className={`space-y-8 ${className}`}>
      {posts.map((post) => (
        <BlogPostItem key={post?._id} post={post} />
      ))}
    </section>
  );
}
