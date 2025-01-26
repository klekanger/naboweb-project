import {
  type MESSAGEBOARD_QUERYResult,
  type BlogPost,
  type DOCUMENTMENU_QUERYResult,
  type FRONTPAGE_HERO_QUERYResult,
  type FRONTPAGE_SERVICES_QUERYResult,
  type MEETING_MINUTES_BY_ID_QUERYResult,
  type MEETING_MINUTES_QUERYResult,
  type OTHER_DOCUMENTS_QUERYResult,
  type Page,
  type SHOWCASE_QUERYResult,
  MESSAGE_BY_ID_QUERYResult,
} from "@/types/sanity.types";
import {
  BLOG_BY_SLUG_QUERY,
  DOCUMENTMENU_QUERY,
  FRONTPAGE_HERO_QUERY,
  FRONTPAGE_SERVICES_QUERY,
  MEETING_MINUTES_BY_ID_QUERY,
  MEETING_MINUTES_QUERY,
  MESSAGE_BY_ID_QUERY,
  MESSAGEBOARD_QUERY,
  OTHER_DOCUMENTS_QUERY,
  PAGE_BY_SLUG_QUERY,
  PRIVATE_BLOG_BY_SLUG_QUERY,
  SHOWCASE_QUERY,
} from "../lib/queries";
import { loadQuery } from "../lib/store";

export async function loadHomePage() {
  const [
    frontpageHeroContent,
    frontpageServicesContent,
    frontpageShowcaseContent,
  ] = await Promise.all([
    loadQuery<FRONTPAGE_HERO_QUERYResult | null>(
      FRONTPAGE_HERO_QUERY,
      {},
      { next: { tags: ["frontpage-hero"] } },
    ),
    loadQuery<FRONTPAGE_SERVICES_QUERYResult | null>(
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
  return loadQuery<Page | null>(
    PAGE_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [`${slug}`] } },
  );
}

export async function loadBlogPageBySlug(slug: string) {
  return loadQuery<BlogPost | null>(
    BLOG_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [`blog:${slug}`] } },
  );
}
export async function loadPrivateBlogPageBySlug(slug: string) {
  return loadQuery<BlogPost | null>(
    PRIVATE_BLOG_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [`blog:${slug}`] } },
  );
}

export async function loadDocumentMenu() {
  return loadQuery<DOCUMENTMENU_QUERYResult | null>(
    DOCUMENTMENU_QUERY,
    {},
    { next: { tags: ["documentMenu"] } },
  );
}

export async function loadOtherDocuments() {
  return loadQuery<OTHER_DOCUMENTS_QUERYResult | null>(
    OTHER_DOCUMENTS_QUERY,
    {},
    { next: { tags: ["fileOtherDocuments"] } },
  );
}

export async function loadMeetingMinutes() {
  return loadQuery<MEETING_MINUTES_QUERYResult | null>(
    MEETING_MINUTES_QUERY,
    {},
    { next: { tags: ["fileMeetingMinutes"] } },
  );
}

export async function loadMeetingMinutesById(meeting: string) {
  return loadQuery<MEETING_MINUTES_BY_ID_QUERYResult | null>(
    MEETING_MINUTES_BY_ID_QUERY,
    { meeting },
    { next: { tags: ["fileMeetingMinutes"] } },
  );
}

export async function loadMessageBoard(pageNumber = 0) {
  const messagesPerPage = 10;
  return loadQuery<MESSAGEBOARD_QUERYResult>(
    MESSAGEBOARD_QUERY,
    {
      start: pageNumber * messagesPerPage,
      end: (pageNumber + 1) * messagesPerPage,
    },
    { next: { tags: ["message"] } },
  );
}

export async function loadMessageById(id: string) {
  return loadQuery<MESSAGE_BY_ID_QUERYResult>(
    MESSAGE_BY_ID_QUERY,
    { id },
    { next: { tags: ["message"] } },
  );
}
