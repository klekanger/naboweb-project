import { frontpageHeroQuery } from "../lib/queries";
import { loadQuery } from "../lib/store";
import type { FrontHero } from "@/types/types";

export async function loadHomePage() {
  const [frontpageHeroContent] = await Promise.all([
    loadQuery<FrontHero>(
      frontpageHeroQuery,
      {},
      { next: { tags: ["frontpage-hero"] } },
    ),
  ]);

  return {
    data: {
      frontpageHeroContent,
    },
  };
}
/* 
export async function loadPage(slug: string) {
	return loadQuery<PagePayload>(
		pagesBySlugQuery,
		{ slug },
		{ next: { tags: [`page:${slug}`] } },
	);
}

export async function loadBlog(slug: string) {
	return loadQuery<PagePayload>(
		blogsBySlugQuery,
		{ slug },
		{ next: { tags: [`blog:${slug}`] } },
	);
}

export async function loadProject(slug: string) {
	return loadQuery<ProjectPayload>(
		projectsBySlugQuery,
		{ slug },
		{ next: { tags: [`project:${slug}`] } },
	);
}

export async function loadSettings() {
	return loadQuery<Settings>(
		settingsQuery,
		{},
		{ next: { tags: ["settings"] } },
	);
}
 */
