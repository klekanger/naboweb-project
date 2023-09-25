import type { BlogPostItemProps, ContentImage } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPostItem(post: BlogPostItemProps) {
  const { title, excerpt, featuredImage, slug, privatePost } = post.fields;
  const { description, url, width, height } = featuredImage!;

  if (!width || !height) {
    console.warn(
      '[blog-post.item.tsx] Missing data in featuredImage prop. Should provide width and height.'
    );
    return null;
  }

  if (!title || !excerpt || !featuredImage || !slug || !url) {
    console.warn(
      '[blog-post.item.tsx] Missing data in post prop. Should provide title, excerpt, featuredImage, slug and url. Ideally also description.'
    );
    return null;
  }

  const urlToPost = privatePost ? `/informasjon/post/${slug}` : `/blog/${slug}`;

  return (
    <article key={post.sys.id}>
      <div className="grid-cols-12 gap-2 pb-2 md:grid md:pb-8 lg:gap-8">
        <div className="relative order-last overflow-hidden rounded-md md:col-span-5 lg:col-span-6">
          <Link href={urlToPost} passHref>
            <Image
              className="aspect-[16/10] rounded-md object-cover duration-200 transition hover:scale-[102%]"
              src={`${url}`}
              alt={description || title}
              width={width}
              height={height}
              sizes="(min-width: 768px) 40vw, (min-width: 1024px) 50vw,100vw"
            />
          </Link>
        </div>

        <div className="md:col-span-7 md:pr-8 lg:col-span-6">
          <Link href={urlToPost} passHref>
            <h2
              className="m4-4 transform cursor-pointer pb-2 pt-0 text-2xl duration-500 transition hover:text-brand-secondary md:mt-0 "
              tabIndex={0}
            >
              {title}
            </h2>
          </Link>
          <p className="mt-2">
            {excerpt &&
              `${excerpt.slice(0, 500)}${excerpt.length > 500 ? '...' : ''}`}
            <Link href={urlToPost} className="pt-4 no-underline md:block">
              Les&nbsp;mer »
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
