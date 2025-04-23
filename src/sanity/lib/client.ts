import { createClient } from "next-sanity";

import {
  apiVersion,
  dataset,
  projectId,
  useCdn,
  studioUrl,
} from "@/sanity/lib/api";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: "published",
  stega: {
    studioUrl: studioUrl ?? "/studio",
    // Set logger to 'console' for more verbose logging
    // logger: console,
    filter: (props) => {
      if (props.sourcePath.at(-1) === "title") {
        return true;
      }

      return props.filterDefault(props);
    },
  },
});

export const clientWithWriteAccess = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
