import {
  BLOGPOSTCOLLECTION_GRAPHQL_FIELDS,
  BLOGPOSTROUTES_GRAPHQL_FIELDS,
  BLOGPOST_GRAPHQL_FIELDS,
  PAGE_GRAPHQL_FIELDS,
  SERVICEMENU_GRAPHQL_FIELDS,
} from "@/lib/graphql-fields";
import type {
  DocumentCollection,
  ReturnTypeForBlogPosts,
  ReturnTypeForDocumentBox,
  ReturnTypeForGetBlogPostRoutes,
  ReturnTypeForGetSlugsForBlogPosts,
  ReturnTypeForPage,
  ReturnTypeForSingleBlogPost,
} from "@/types/types";

/**
 * Fetches data from a GraphQL API.
 *
 * @param  query - The GraphQL query string.
 * @param  preview - Indicates whether to use the preview access token.
 * @returns  - A promise that resolves to the fetched data.
 */
async function fetchGraphQL<T>(query: string, preview = false): Promise<T> {
  if (typeof window !== "undefined") {
    throw new Error("FetchGraphQL must be used only on the server");
  }

  if (!process.env.CONTENTFUL_SPACE_ID) {
    throw new Error("CONTENTFUL_SPACE_ID is not set");
  }

  const url = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`;
  const accessToken = preview
    ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN ?? ""
    : process.env.CONTENTFUL_ACCESS_TOKEN ?? "";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch – ${response.status}`);
  }

  const responseData = (await response.json()) as T;

  return responseData;
}

/**
 * Retrieves page data with the specified ID.
 *
 * @param  id - The ID of the page to retrieve.
 * @return - A promise that resolves to the fetched page data.
 */
export async function getPageWithId(id: string): Promise<ReturnTypeForPage> {
  try {
    const query = `query {
      page(id: "${id}") {
          ${PAGE_GRAPHQL_FIELDS}
      }
    }`;

    const pageData = await fetchGraphQL<ReturnTypeForPage>(query, true);

    return pageData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch page data");
  }
}

/**
 * Retrieves a blog post with the specified slug.
 *
 * @param  slug - The slug of the post to retrieve.
 * @return - A promise that resolves to the fetched page data.
 */
export async function getBlogPostWithSlug({
  slug,
  isPrivate,
}: {
  slug: string;
  isPrivate: boolean;
}) {
  if (!slug) {
    throw new Error("Missing slug");
  }

  try {
    const query = `query {
      blogPostCollection(limit: 1, where: {privatePost: ${isPrivate}, slug: "${slug}"}) {     
          ${BLOGPOST_GRAPHQL_FIELDS}
      }
    }`;
    const blogPostData = await fetchGraphQL<ReturnTypeForSingleBlogPost>(query);

    const {
      data: { blogPostCollection: { total, items } },
    } = blogPostData;

    return { total, items, isPrivate };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch page data");
  }
}

/**
 * Retrieves some blog posts from the Contentful API.
 *
 * @param pageNumber - The page number to retrieve
 * @param postsPerPage - The number of posts to retrieve per page
 * @isPrivate - Boolean - show only private posts
 * @return – A promise that resolves to an object containing the total number of blog posts and an array of blog post items.
 */
export async function getBlogPostCollection({
  pageNumber = 1,
  postsPerPage = 5,
  isPrivate = false,
}) {
  try {
    const query = `query {
      blogPostCollection(
        order: sys_firstPublishedAt_DESC
        limit:${postsPerPage}, 
        skip: ${(pageNumber - 1) * postsPerPage},
        where:{privatePost: ${isPrivate}}) {
        ${BLOGPOSTCOLLECTION_GRAPHQL_FIELDS}
      }
    }
    `;

    const blogPostCollectionData = fetchGraphQL<ReturnTypeForBlogPosts>(query);

    const {
      data: { blogPostCollection: { total, items } },
    } = await blogPostCollectionData;
    return { total, items, isPrivate };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch blog post collection data");
  }
}

// Retrieves all possible blog post routes
export async function getBlogPostRoutes({ isPrivate = false }) {
  try {
    const query = `query {
      blogPostCollection(limit:5, where:{privatePost: ${isPrivate}}) {
        ${BLOGPOSTROUTES_GRAPHQL_FIELDS}
      }
    }
    `;

    const blogPostRoutes =
      await fetchGraphQL<ReturnTypeForGetBlogPostRoutes>(query);

    return { total: blogPostRoutes.data.blogPostCollection.total };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch blog post routes");
  }
}

// Retrieves all possible slugs for blog posts
export async function getSlugsForBlogPost({ isPrivate = false }) {
  try {
    const query = `query {
      blogPostCollection (where: {privatePost: ${isPrivate}}) {
        items {
          slug
        }
      }
    }
    `;

    const blogPostRoutes =
      await fetchGraphQL<ReturnTypeForGetSlugsForBlogPosts>(query);

    return blogPostRoutes;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch blog post routes");
  }
}

// ***********************
// Retrieves all documents
// ***********************
export async function getDocuments({
  getDocumentsQuery,
}: {
  getDocumentsQuery: string;
}) {
  if (!getDocumentsQuery) {
    throw new Error("Missing getDocumentsQuery");
  }

  const pageNumber = 1;
  const postsPerPage = 5;
  try {
    const query = `query {
        ${getDocumentsQuery}
    }
    `;

    const documentCollection = await fetchGraphQL<DocumentCollection>(query);

    return documentCollection;
  } catch (error) {
    console.error(error);
    throw new Error(`Something went wrong – ${error}`);
  }
}

// ***************************************
// Retrives text and files for DocumentBox
// ***************************************
export async function getDocumentBoxFields() {
  const query = `query {
    ${SERVICEMENU_GRAPHQL_FIELDS}
  }
  `;

  const serviceMenuFields = await fetchGraphQL<ReturnTypeForDocumentBox>(query);

  return serviceMenuFields;
}

// TODO Add pagination to getDocuments
