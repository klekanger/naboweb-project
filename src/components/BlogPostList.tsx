import BlogPostItem from '@/components/BlogPostItem';
import type { BlogPostItemProps } from '@/types/types';
import type { ComponentPropsWithoutRef } from 'react';

export default function BlogPostList({
  posts,
  ...rest
}: {
  posts: BlogPostItemProps[];
} & ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={`space-y-8 ${rest.className ?? ''}`}>
      {posts.map((post) => (
        <BlogPostItem key={post.sys.id} {...post} />
      ))}
    </section>
  );
}
