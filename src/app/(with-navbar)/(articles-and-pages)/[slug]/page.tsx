import Page from "@/components/pages/page/Page";
import { urlForOpenGraphImage } from "@/sanity/lib/utils";
import { generateStaticSlugs } from "@/sanity/loader/generateStaticSlugs";
import { loadPageBySlug } from "@/sanity/loader/loadQuery";
import { Metadata, ResolvingMetadata } from "next";
import { toPlainText } from "next-sanity";
import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import type { Image as SanityImage } from "sanity";

const PagePreview = dynamic(
  () => import("@/components/pages/page/PagePreview"),
);

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

export async function generateStaticParams() {
  return await generateStaticSlugs("page");
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
