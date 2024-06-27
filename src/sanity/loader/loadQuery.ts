import {
  BLOG_BY_SLUG_QUERY,
  DOCUMENTMENU_QUERY,
  FRONTPAGE_HERO_QUERY,
  FRONTPAGE_SERVICES_QUERY,
  MEETING_MINUTES_QUERY,
  OTHER_DOCUMENTS_QUERY,
  PAGE_BY_SLUG_QUERY,
  PRIVATE_BLOG_BY_SLUG_QUERY,
  SHOWCASE_QUERY,
} from "../lib/queries";
import { loadQuery } from "../lib/store";
import type {
  BlogPost,
  DOCUMENTMENU_QUERYResult,
  FRONTPAGE_HERO_QUERYResult,
  FRONTPAGE_SERVICES_QUERYResult,
  OTHER_DOCUMENTS_QUERYResult,
  Page,
  SHOWCASE_QUERYResult,
} from "@/types/sanity.types";

export async function loadHomePage() {
  const [
    frontpageHeroContent,
    frontpageServicesContent,
    frontpageShowcaseContent,
  ] = await Promise.all([
    loadQuery<FRONTPAGE_HERO_QUERYResult>(
      FRONTPAGE_HERO_QUERY,
      {},
      { next: { tags: ["frontpage-hero"] } },
    ),
    loadQuery<FRONTPAGE_SERVICES_QUERYResult>(
      FRONTPAGE_SERVICES_QUERY,
      {},
      { next: { tags: ["frontpage-services"] } },
    ),
    loadQuery<SHOWCASE_QUERYResult>(
      SHOWCASE_QUERY,
      {},
      { next: { tags: ["showcase"] } },
    ),
  ]);

  return {
    data: {
      frontpageHeroContent,
      frontpageServicesContent,
      frontpageShowcaseContent,
    },
  };
}

export async function loadPageBySlug(slug: string) {
  return loadQuery<Page>(
    PAGE_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [`${slug}`] } },
  );
}

export async function loadBlogPageBySlug(slug: string) {
  return loadQuery<BlogPost>(
    BLOG_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [`blog:${slug}`] } },
  );
}
export async function loadPrivateBlogPageBySlug(slug: string) {
  return loadQuery<BlogPost>(
    PRIVATE_BLOG_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [`blog:${slug}`] } },
  );
}

export async function loadDocumentMenu() {
  return loadQuery<DOCUMENTMENU_QUERYResult>(
    DOCUMENTMENU_QUERY,
    {},
    { next: { tags: ["documentMenu"] } },
  );
}

export async function loadOtherDocuments() {
  return loadQuery<OTHER_DOCUMENTS_QUERYResult>(
    OTHER_DOCUMENTS_QUERY,
    {},
    { next: { tags: ["fileOtherDocuments"] } },
  );
}

export async function loadMeetingMinutes() {
  return loadQuery(
    MEETING_MINUTES_QUERY,
    {},
    { next: { tags: ["fileMeetingMinutes"] } },
  );
}

/*

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
