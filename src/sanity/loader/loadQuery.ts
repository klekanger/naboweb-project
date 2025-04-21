import type {
  MessageboardQueryResult,
  BlogPost,
  DocumentMenuQueryResult,
  FrontpageHeroQueryResult,
  FrontpageServicesQueryResult,
  MeetingMinutesByIdQueryResult,
  MeetingMinutesQueryResult,
  OtherDocumentsQueryResult,
  Page,
  ShowcaseQueryResult,
  MessageByIdQueryResult,
  UserSubscriptionStatusQueryResult,
} from "@/types/sanity.types";
import {
  blogBySlugQuery,
  documentMenuQuery,
  frontpageHeroQuery,
  frontpageServicesQuery,
  meetingMinutesByIdQuery,
  meetingMinutesQuery,
  messageByIdQuery,
  messageboardQuery,
  otherDocumentsQuery,
  pageBySlugQuery,
  privateBlogBySlugQuery,
  showcaseQuery,
  userSubscriptionStatusQuery,
} from "../lib/queries";
import { loadQuery } from "../lib/store";

export async function loadHomePage() {
  const [
    frontpageHeroContent,
    frontpageServicesContent,
    frontpageShowcaseContent,
  ] = await Promise.all([
    loadQuery<FrontpageHeroQueryResult | null>(
      frontpageHeroQuery,
      {},
      { next: { tags: ["frontpage-hero"] } },
    ),
    loadQuery<FrontpageServicesQueryResult | null>(
      frontpageServicesQuery,
      {},
      { next: { tags: ["frontpage-services"] } },
    ),
    loadQuery<ShowcaseQueryResult>(
      showcaseQuery,
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
    pageBySlugQuery,
    { slug },
    { next: { tags: [`${slug}`] } },
  );
}

export async function loadBlogPageBySlug(slug: string) {
  return loadQuery<BlogPost | null>(
    blogBySlugQuery,
    { slug },
    { next: { tags: [`blog:${slug}`] } },
  );
}

export async function loadPrivateBlogPageBySlug(slug: string) {
  return loadQuery<BlogPost | null>(
    privateBlogBySlugQuery,
    { slug },
    { next: { tags: [`blog:${slug}`] } },
  );
}

export async function loadDocumentMenu() {
  return loadQuery<DocumentMenuQueryResult | null>(
    documentMenuQuery,
    {},
    { next: { tags: ["documentMenu"] } },
  );
}

export async function loadOtherDocuments() {
  return loadQuery<OtherDocumentsQueryResult | null>(
    otherDocumentsQuery,
    {},
    { next: { tags: ["fileOtherDocuments"] } },
  );
}

export async function loadMeetingMinutes() {
  return loadQuery<MeetingMinutesQueryResult | null>(
    meetingMinutesQuery,
    {},
    { next: { tags: ["fileMeetingMinutes"] } },
  );
}

export async function loadMeetingMinutesById(meeting: string) {
  return loadQuery<MeetingMinutesByIdQueryResult | null>(
    meetingMinutesByIdQuery,
    { meeting },
    { next: { tags: ["fileMeetingMinutes"] } },
  );
}

export async function loadMessageBoard(pageNumber = 0) {
  const messagesPerPage = 10;
  return loadQuery<MessageboardQueryResult>(
    messageboardQuery,
    {
      start: pageNumber * messagesPerPage,
      end: (pageNumber + 1) * messagesPerPage,
    },
    { next: { tags: ["message"] } },
  );
}

export async function loadMessageById(id: string) {
  return loadQuery<MessageByIdQueryResult>(
    messageByIdQuery,
    { id },
    { next: { tags: ["message"] } },
  );
}

export async function loadUserSubscriptionStatus(id: string) {
  return loadQuery<UserSubscriptionStatusQueryResult>(
    userSubscriptionStatusQuery,
    { id },
    { next: { tags: ["userSubscriptionStatus"] } },
  );
}
