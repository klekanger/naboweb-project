import { defineQuery, groq } from "next-sanity";
import { client } from "../lib/client";

export const userSubscriptionStatusQuery = defineQuery(`
  *[_type=="authors" && _id==$id][0] {
    emailSubscription
  }
`);

export const documentMenuQuery = defineQuery(`
  *[_type=="documentMenu"] {
    button1Text,
    button2Text,
    button3Text,
    button4Text,
    'file1': button1File->otherDocument.asset->{url},
    'file2': button2File->otherDocument.asset->{url},
    'file3': button3File->otherDocument.asset->{url},
    'file4': button4File->otherDocument.asset->{url},
  }[0]
`);

export const otherDocumentsQuery = defineQuery(`
  *[_type=="fileOtherDocuments"] {
    title,
    description,
    tags,
    _createdAt,
    _updatedAt,
    'document': otherDocument{
      asset->{url, _id, originalFilename}
    }
  }
`);

export const meetingMinutesQuery = defineQuery(`
  *[_type=="fileMeetingMinutes"] | order(_createdAt asc) {
    _id,
    title,
    description,
    meetingDate,
    meetingPlace,
    tags,
    _createdAt,
    _updatedAt,
    "documentCount": count(meetingDocuments)
  }
`);

export const meetingMinutesByIdQuery = defineQuery(`
  *[_type=="fileMeetingMinutes" && _id == $meeting] | order(_createdAt asc)[0] {
    _id,
    title,
    description,
    meetingDate,
    meetingPlace,
    tags,
    _createdAt,
    _updatedAt,
    meetingDocuments[]{asset->{
      url, 
      _id, 
      originalFilename,
      extension,
      size,
      _createdAt, 
      _updatedAt
    }}
  }
`);

export const frontpageHeroQuery = defineQuery(`
  *[_type=="frontpage-hero"]{
    title,
    subtitle,
    showButton,
    buttonText,
    buttonLink->{slug},
    heroImage{..., "lqip": asset->metadata.lqip},
    bodyText
  }[0]
`);

export const frontpageServicesQuery = defineQuery(`
  *[_type=="frontpage-services"]{
    title1,title2,title3,
    url1,url2,url3,
    description1,description2,description3,
    url1,url2,url3,
    icon1,icon2,icon3,
    private1,private2,private3
  }[0]
`);

export const pageBySlugQuery = defineQuery(`
  *[_type=="page" && slug.current == $slug][0]{
    _id,
    _createdAt,
    _updatedAt,
    title,
    mainImage{..., "lqip": asset->metadata.lqip},
    overview,
    body[]{
      ...,
      _type == "image" => {
        ...,
        "lqip": asset->metadata.lqip
      }
    },
    "slug": slug.current
  }
`);

export const blogBySlugQuery = defineQuery(`
  *[_type=="blogPost" && slug.current == $slug && privatePost != true][0]{
    _id,
    _createdAt,
    _updatedAt,
    privatePost,
    title,
    excerpt,
    featuredImage{..., "lqip": asset->metadata.lqip},
    bodyText[]{
      ...,
      _type == "image" => {
        ...,
        "lqip": asset->metadata.lqip
      }
    },
    "slug": slug.current,
    author[]->{...},
  }
`);

export const allBlogBySlugQuery = defineQuery(`
  *[_type=="blogPost" && slug.current == $slug][0]{
    _id,
    _createdAt,
    _updatedAt,
    privatePost,
    title,
    excerpt,
    featuredImage{..., "lqip": asset->metadata.lqip},
    bodyText[]{
      ...,
      _type == "image" => {
        ...,
        "lqip": asset->metadata.lqip
      }
    },
    "slug": slug.current,
    author[]->{...},
  }
`);

export const privateBlogBySlugQuery = defineQuery(`
  *[_type=="blogPost" && slug.current == $slug && privatePost == true][0] {
    _id,
    _createdAt,
    _updatedAt,
    privatePost,
    title,
    excerpt,
    featuredImage{..., "lqip": asset->metadata.lqip},
    bodyText[]{
      ...,
      _type == "image" => {
        ...,
        "lqip": asset->metadata.lqip
      }
    },
    "slug": slug.current,
    author[]->{...},
  }
`);

export const showcaseQuery = defineQuery(`
  *[_type=="frontpage-showcase"][0]{
    _id,
    _createdAt,
    _updatedAt,
    showcaseTitle,
    showcaseBlogposts[]->{
      _id, 
      title, 
      excerpt, 
      featuredImage{..., "lqip": asset->metadata.lqip}, 
      slug
    },
  }
`);

export const countPublicBlogPostsQuery = defineQuery(`
  count(*[_type=="blogPost" && privatePost==false])
`);

export const countPrivateBlogPostsQuery = defineQuery(`
  count(*[_type=="blogPost" && privatePost==true])
`);

export const messageboardQuery = defineQuery(`
  *[_type == "message"] | order(_createdAt desc) [$start...$end] {
    _id,
    _updatedAt,
    _createdAt,
    title,
    messageImage,
    bodyText,
    tags,
    comments[]{
      _key,
      commentText,
      commentTitle,
      commentAuthor->{_id, firstName, lastName}
    },
    fromAdmin,
    author->{_id, firstName, lastName}
  }
`);

export const messageByIdQuery = defineQuery(`
  *[_type == "message" && _id == $id][0] {
    _id,
    _updatedAt,
    _createdAt,
    title,
    messageImage,
    bodyText,
    tags,
    comments[]{
      _key,
      commentText,
      commentTitle,
      commentAuthor->{_id, firstName, lastName},
      published,
    },
    fromAdmin,
    author->{_id, firstName, lastName},
  }
`);

export const allMessageIdsQuery = defineQuery(`
  *[_type == "message"]{_id}
`);

export const countMessagesQuery = defineQuery(`
  count(*[_type=="message"])
`);

// Helper functions that use the defined queries
export async function countBlogPosts({
  privatePosts,
}: {
  privatePosts: boolean;
}) {
  if (privatePosts) {
    return client.fetch(countPrivateBlogPostsQuery);
  } else {
    return client.fetch(countPublicBlogPostsQuery);
  }
}

export async function countMessages() {
  return client.fetch(countMessagesQuery);
}

export const blogCollectionQuery = groq`
  *[_type=="blogPost" && 
  privatePost==$isPrivate] | order(_createdAt desc) [$start...$end]
  {
    _id,
    _createdAt,
    _updatedAt,
    featuredImage{..., "lqip": asset->metadata.lqip},
    excerpt,
    privatePost,
    title,
    "slug": slug.current
  }      
`;

export const pageSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`);

export const blogSlugs = defineQuery(`
  *[_type == "blogPost" && defined(slug.current)]
  {"slug": slug.current}
`);

export const privateBlogSlugs = defineQuery(`
  *[_type == "blogPost" && defined(slug.current) && privatePost == true]
  {"slug": slug.current}
`);

export const messageSlugs = defineQuery(`
  *[_type == "message" && defined(slug.current)]
  {"slug": slug.current}
`);

export const meetingMinutesIds = defineQuery(`
  *[_type == "fileMeetingMinutes"]{_id}
`);
