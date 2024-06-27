import BlogPostItem from "@/components/BlogPostItem";
import { BlogPost } from "@/types/sanity.types";
import { BlogCollection } from "@/types/types";

export default function BlogPostList(props: {
  posts: BlogPost[];
  className?: string;
}) {
  const { posts, className } = props;

  return (
    <section className={`space-y-8 ${className}`}>
      {posts.map((post) => (
        <BlogPostItem key={post._id} post={post} />
      ))}
    </section>
  );
}
