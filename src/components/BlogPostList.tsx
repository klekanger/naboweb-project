import BlogPostItem from "@/components/BlogPostItem";
import { BlogBySlugQueryResult } from "@/types/sanity.types";

export default function BlogPostList(props: {
  posts: BlogBySlugQueryResult[];
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
