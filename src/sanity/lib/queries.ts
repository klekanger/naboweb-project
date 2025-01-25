import { BLOG_BY_SLUG_QUERYResult, BlogPost } from "@/types/sanity.types";
import { groq } from "next-sanity";
import { client } from "../lib/client";

export const DOCUMENTMENU_QUERY = groq`
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
`;

export const OTHER_DOCUMENTS_QUERY = groq`
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
`;

export const MEETING_MINUTES_QUERY = groq`
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
`;

export const MEETING_MINUTES_BY_ID_QUERY = groq`
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
`;

export const FRONTPAGE_HERO_QUERY = groq`
  *[_type=="frontpage-hero"]{
    title,
    subtitle,
    showButton,
    buttonText,
    buttonLink->{slug},
    heroImage{..., "lqip": asset->metadata.lqip},
    bodyText
  }[0]
`;

export const FRONTPAGE_SERVICES_QUERY = groq`
  *[_type=="frontpage-services"]{
    title1,title2,title3,
      url1,url2,url3,
      description1,description2,description3,
      url1,url2,url3,
      icon1,icon2,icon3,
      private1,private2,private3
  }[0]
`;

export const PAGE_BY_SLUG_QUERY = groq`
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
`;

// Fetch blog by slug, except if private post
export const BLOG_BY_SLUG_QUERY = groq`
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
`;
// Fetch all blog posts by slug
export const ALL_BLOG_BY_SLUG_QUERY = groq`
  *[_type=="blogPost" && slug.current == $slug ][0]{
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
`;

// Fetch private blog post by slug
export const PRIVATE_BLOG_BY_SLUG_QUERY = groq`
  *[_type=="blogPost" && slug.current == $slug && privatePost == true][0]{
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
`;

export const SHOWCASE_QUERY = groq`
  *[_type=="frontpage-showcase" ][0]{
    _id,
    _createdAt,
      _updatedAt,
      showcaseTitle,
      showcaseBlogposts[]->{
        _id, 
        title, 
        excerpt, 
        featuredImage{..., "lqip": asset->metadata.lqip}, 
        slug},
  }
`;

export const COUNT_PUBLIC_BLOG_POSTS = groq`
  count(*[_type=="blogPost" && privatePost==false])
`;

export const COUNT_PRIVATE_BLOG_POSTS = groq`
  count(*[_type=="blogPost" && privatePost==true])
`;

export const MESSAGEBOARD_QUERY = groq`
*[_type == "message"] | order(_createdAt desc) {
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
`;

export const MESSAGE_BY_ID_QUERY = groq`
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
    published
  },
  fromAdmin,
  author->{_id, firstName, lastName}
}
`;

export const COUNT_MESSAGES = groq`
  count(*[_type=="message"])
`;

export async function countBlogPosts({
  privatePosts,
}: {
  privatePosts: boolean;
}) {
  if (privatePosts) {
    return client.fetch<number>(COUNT_PRIVATE_BLOG_POSTS);
  } else {
    return client.fetch<number>(COUNT_PUBLIC_BLOG_POSTS);
  }
}

export async function countMessages() {
  return client.fetch<number>(COUNT_MESSAGES);
}

export async function fetchBlogCollection({
  pageNumber = 1,
  postsPerPage = 5,
  isPrivate = false,
}: {
  pageNumber?: number;
  postsPerPage?: number;
  isPrivate?: boolean;
}): Promise<BLOG_BY_SLUG_QUERYResult[]> {
  return client.fetch(
    groq`
      *[_type=="blogPost" && 
      privatePost==$isPrivate] | order(_createdAt asc) [$start...$end]
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
    `,
    {
      start: pageNumber * postsPerPage,
      end: (pageNumber + 1) * postsPerPage,
      isPrivate,
    },
  );
}
