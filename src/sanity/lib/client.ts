import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, useCdn, studioUrl } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: "published",
  stega: {
    enabled: false,
    studioUrl: studioUrl ?? "/studio",
  },
});

export const clientWithWriteAccess = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
