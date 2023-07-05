import type { BlogPostItemProps } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPostItem(post: BlogPostItemProps) {
  const { title, excerpt, featuredImage, slug } = post?.fields;
  const { description } = featuredImage?.fields;
  const { url } = featuredImage?.fields?.file;

  return (
    <div key={post.sys.id}>
      <div className="grid-cols-12 gap-2 pb-2 md:grid md:pb-8 lg:gap-8">
        <div className="relative order-last cursor-pointer rounded-md md:col-span-5  lg:col-span-6">
          <Link href={`/blog/${slug}`} passHref>
            <Image
              className="aspect-video rounded-md object-cover transition duration-200 hover:scale-[102%]"
              src={`https://${url}`}
              alt={description}
              width={featuredImage.fields.file.details.image.width}
              height={featuredImage.fields.file.details.image.height}
              sizes="(min-width: 768px) 40vw, (min-width: 1024px) 50vw,100vw"
            />
          </Link>
        </div>

        <div className="md:col-span-7 md:pr-8 lg:col-span-6">
          <Link href={`/blog/${slug}`} passHref>
            <h2
              className="m4-4 transform cursor-pointer pb-2 pt-0 text-2xl transition duration-500 hover:text-brand-secondary md:mt-0 "
              tabIndex={0}
            >
              {title}
            </h2>
          </Link>
          <p className="mt-2">
            {excerpt &&
              `${excerpt.slice(0, 500)}${excerpt.length > 500 ? '...' : ''}`}
            <Link href={`/blog/${slug}`} className="pt-4 no-underline md:block">
              Les&nbsp;mer »
            </Link>
          </p>
        </div>
      </div>
      <hr className="border-dashed border-slate-300 dark:border-slate-700" />
    </div>
  );
}
