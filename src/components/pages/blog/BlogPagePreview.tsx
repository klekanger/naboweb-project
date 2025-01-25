"use client";

import { type QueryResponseInitial } from "@sanity/react-loader";
import BlogPage from "./BlogPage";
import { useQuery } from "@/sanity/loader/useQuery";
import { ALL_BLOG_BY_SLUG_QUERY } from "@/sanity/lib/queries";

type Props = {
  params: { slug: string };
  initial: QueryResponseInitial<any>;
};

export default function BlogPagePreview(props: Props) {
  const { params, initial } = props;

  const { data } = useQuery(
    ALL_BLOG_BY_SLUG_QUERY,
    { slug: params.slug },
    { initial },
  );

  return <BlogPage data={data} />;
}
