import BlogPostItem from '@/components/BlogPostItem';
import type { BlogPostItemProps, BlogPostListProps } from '@/types/types';

export default function BlogPostList({
  posts,
}: {
  posts: BlogPostItemProps[];
}) {
  return (
    <div className="mt-8 space-y-8">
      {posts.map((post) => (
        <BlogPostItem key={post.sys.id} {...post} />
      ))}
    </div>
  );
}
