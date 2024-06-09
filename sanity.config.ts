"use client";

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { nbNOLocale } from "@sanity/locale-nb-no";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { pageStructure, singletonPlugin } from "./sanity/plugins/settings";
import blog from "./sanity/schemas/documents/blog";
import fileMeetingMinutes from "./sanity/schemas/documents/fileMeetingMinutes";
import fileOtherDocuments from "./sanity/schemas/documents/fileOtherDocuments";
import page from "./sanity/schemas/documents/page";
import { twitter } from "./sanity/schemas/objects/twitter";
import { youtube } from "./sanity/schemas/objects/youtube";
import documentMenu from "./sanity/schemas/singletons/documentMenu";
import frontpageHero from "./sanity/schemas/singletons/frontpage-hero";
import settings from "./sanity/schemas/singletons/settings";
import authors from "./sanity/schemas/documents/authors"

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "./sanity/env";

export default defineConfig({
  title: `gartnerihagen-askim.no [dataset: ${dataset}]`,
  basePath: "/studio",
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schema' folder
  schema: {
    types: [
      // Documents
      page,
      blog,
      authors,

      // Singletons
      frontpageHero,
      fileMeetingMinutes,
      fileOtherDocuments,
      documentMenu,
      settings,

      // Objects
      youtube,
      twitter,
    ],
  },
  plugins: [
    structureTool({
      title: "Innhold",
      structure: pageStructure([settings, frontpageHero, documentMenu]),
    }),
    singletonPlugin([settings.name, frontpageHero.name, documentMenu.name]),
    visionTool({ defaultApiVersion: apiVersion }),
    nbNOLocale(),
  ],
});
