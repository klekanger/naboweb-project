import type { MetadataRoute } from "next";
import { defineQuery } from "next-sanity";
import { BLOG_COLLECTION_POSTS_PER_PAGE, SITE_URL } from "@/lib/constants";
import { sanityFetch } from "@/sanity/lib/live";
import { countBlogPosts } from "@/sanity/lib/queries";

type SitemapSlugEntry = {
  slug: string;
  _updatedAt?: string;
};

const pageSitemapEntriesQuery = defineQuery(`
  *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`);

const publicBlogSitemapEntriesQuery = defineQuery(`
  *[_type == "blogPost" && defined(slug.current) && privatePost != true]{
    "slug": slug.current,
    _updatedAt
  }
`);

function toLastModifiedDate(value: string | undefined) {
  return value ? new Date(value) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: pages }, { data: blogPosts }, publicBlogPostCount] =
    await Promise.all([
      sanityFetch({
        query: pageSitemapEntriesQuery,
        perspective: "published",
        stega: false,
      }),
      sanityFetch({
        query: publicBlogSitemapEntriesQuery,
        perspective: "published",
        stega: false,
      }),
      countBlogPosts({ privatePosts: false }),
    ]);

  const totalBlogCollectionPages = Math.max(
    1,
    Math.ceil(Number(publicBlogPostCount) / BLOG_COLLECTION_POSTS_PER_PAGE),
  );

  const blogCollectionPages: MetadataRoute.Sitemap = Array.from({
    length: totalBlogCollectionPages,
  }).map((_, i) => ({
    url: `${SITE_URL}/blog-collection/${i + 1}`,
    lastModified: new Date(),
  }));

  const pageEntries: MetadataRoute.Sitemap = (pages as SitemapSlugEntry[]).map(
    (entry) => ({
      url: `${SITE_URL}/${entry.slug}`,
      lastModified: toLastModifiedDate(entry._updatedAt),
    }),
  );

  const blogEntries: MetadataRoute.Sitemap = (
    blogPosts as SitemapSlugEntry[]
  ).map((entry) => ({
    url: `${SITE_URL}/blog/${entry.slug}`,
    lastModified: toLastModifiedDate(entry._updatedAt),
  }));

  return [
    { url: SITE_URL, lastModified: new Date() },
    ...pageEntries,
    ...blogCollectionPages,
    ...blogEntries,
  ];
}
