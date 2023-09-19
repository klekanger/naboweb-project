// import * as contentful from 'contentful';

import {
  BLOGPOSTCOLLECTION_GRAPHQL_FIELDS,
  BLOGPOSTROUTES_GRAPHQL_FIELDS,
  PAGE_GRAPHQL_FIELDS,
} from '@/lib/graphql-fields';
import {
  fetchGraphQLReturnTypeForBlogPosts as ReturnTypeForBlogPosts,
  fetchGraphQLReturnTypeForPage as ReturnTypeForPage,
} from '@/types/types';

/**
 * Fetches data from a GraphQL API.
 *
 * @param  query - The GraphQL query string.
 * @param  [preview=false] - Indicates whether to use the preview access token.
 * @returns  - A promise that resolves to the fetched data.
 */
async function fetchGraphQL<T>(query: string, preview = false): Promise<T> {
  // Check if running on the server or on the browser
  if (typeof window !== 'undefined') {
    throw new Error(
      'The `fetchGraphQL` function must only be used on the server'
    );
  }

  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ['posts'] },
    }
  ).then((response) => response.json());
}

/**
 * Retrieves page data with the specified ID.
 *
 * @param  id - The ID of the page to retrieve.
 * @return - A promise that resolves to the fetched page data.
 */
export async function getPageWithId(id: string) {
  try {
    const pageData = fetchGraphQL<ReturnTypeForPage>(
      `query {
        page(id: "${id}") {
            ${PAGE_GRAPHQL_FIELDS}
        }
      }`,
      true
    );

    return pageData;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch page data');
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
  postsPerPage = 5, // just some sensible default
  isPrivate = false,
}) {
  try {
    const blogPostCollectionData = fetchGraphQL<ReturnTypeForBlogPosts>(
      `query {
        blogPostCollection(
          limit:${postsPerPage}, 
          skip: ${(pageNumber - 1) * postsPerPage},
          where:{privatePost: ${isPrivate}}) {
          ${BLOGPOSTCOLLECTION_GRAPHQL_FIELDS}
        }
      }
      `
    );

    const data = await blogPostCollectionData;
    const {
      data: {
        blogPostCollection: { total, items },
      },
    } = data;

    return { total, items };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch blog post collection data');
  }
}

// Retrieves all possible blog post routes
export async function getBlogPostRoutes(isPrivate = false) {
  try {
    const blogPostRoutes = fetchGraphQL(
      `query {
        blogPostCollection(limit:5, where:{privatePost: ${isPrivate}}) {
          ${BLOGPOSTROUTES_GRAPHQL_FIELDS}
        }
      }
      `
    );
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch blog post routes');
  }
}
