import Page from "@/components/pages/page/Page";
import { loadPageBySlug } from "@/sanity/loader/loadQuery";
import { generateStaticSlugs } from "@/sanity/loader/generateStaticSlugs";
import { notFound } from "next/navigation";
import PagePreview from "@/components/pages/page/PagePreview";
import { draftMode } from "next/headers";
import { Metadata, ResolvingMetadata } from "next";
import { toPlainText } from "next-sanity";
import { urlForOpenGraphImage } from "@/sanity/lib/utils";
import type { Image as SanityImage } from "sanity";

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { data: pageData } = await loadPageBySlug(params.slug);
  const description = toPlainText(pageData?.overview ?? []) ?? "";
  let ogImage = "/og_naboweb.webp";

  if (pageData && "mainImage" in pageData) {
    ogImage =
      urlForOpenGraphImage(pageData.mainImage as SanityImage) ?? ogImage;
  }

  return {
    title: pageData?.title,
    description,
    openGraph: {
      title: pageData?.title || "",
      description,
      images: [ogImage],
    },
  };
}

export function generateStaticParams() {
  return generateStaticSlugs("page");
}

export default async function PageSlugRoute({
  params,
}: {
  params: { slug: string };
}) {
  const initial = await loadPageBySlug(params?.slug);

  if (draftMode().isEnabled) {
    return <PagePreview params={params} initial={initial} />;
  }

  if (!initial.data) {
    notFound();
  }

  return <Page data={initial.data} />;
}
