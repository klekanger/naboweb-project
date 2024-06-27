"use client";

import HomePage from "@/components/pages/home/HomePage";
import {
  FRONTPAGE_HERO_QUERY,
  FRONTPAGE_SERVICES_QUERY,
  SHOWCASE_QUERY,
} from "@/sanity/lib/queries";
import { useQuery } from "@/sanity/loader/useQuery";
import type { HomePagePayload, HomePageProps } from "@/types/types";
import type { QueryResponseInitial } from "@sanity/react-loader";

type Props = HomePageProps & {
  initial: QueryResponseInitial<HomePagePayload | null>;
};

export default function HomePagePreview(props: Props) {
  const { initial } = props;

  function initializeContent<T>(query: string, initialData: T | null = null) {
    return useQuery(
      query,
      {},
      { initial: initialData as QueryResponseInitial<unknown> },
    );
  }

  const data = {
    frontpageHeroContent: initializeContent(
      FRONTPAGE_HERO_QUERY,
      initial?.data?.frontpageHeroContent,
    ),
    frontpageServicesContent: initializeContent(
      FRONTPAGE_SERVICES_QUERY,
      initial?.data?.frontpageServicesContent,
    ),
    frontpageShowcaseContent: initializeContent(
      SHOWCASE_QUERY,
      initial?.data?.frontpageShowcaseContent,
    ),
  };

  if (!data) {
    return (
      <div className="text-center">
        Rediger innholdet for å se forhåndsvisning av forsiden!
      </div>
    );
  }

  return <HomePage data={data as HomePagePayload} />;
}
