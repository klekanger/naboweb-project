"use client";

import { type QueryResponseInitial } from "@sanity/react-loader";
import Page from "./Page";
import { useQuery } from "@/sanity/loader/useQuery";
import { PAGE_BY_SLUG_QUERY } from "@/sanity/lib/queries";

type Props = {
  params: { slug: string };
  initial: QueryResponseInitial<any>;
};

export default function PagePreview(props: Props) {
  const { params, initial } = props;

  const { data } = useQuery(
    PAGE_BY_SLUG_QUERY,
    { slug: params.slug },
    { initial },
  );

  return <Page data={data} />;
}
