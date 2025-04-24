"use client";

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { pageStructure, singletonPlugin } from "./src/sanity/plugins/settings";
import authors from "./src/sanity/schemas/documents/authors";
import blogPost from "./src/sanity/schemas/documents/blog";
import fileMeetingMinutes from "./src/sanity/schemas/documents/fileMeetingMinutes";
import fileOtherDocuments from "./src/sanity/schemas/documents/fileOtherDocuments";
import { message } from "./src/sanity/schemas/documents/message";
import page from "./src/sanity/schemas/documents/page";
import { iconType } from "./src/sanity/schemas/objects/icons";
import { twitter } from "./src/sanity/schemas/objects/twitter";
import { youtube } from "./src/sanity/schemas/objects/youtube";
import documentMenu from "./src/sanity/schemas/singletons/documentMenu";
import frontpageHero from "./src/sanity/schemas/singletons/frontpage-hero";
import services from "./src/sanity/schemas/singletons/services";
import settings from "./src/sanity/schemas/singletons/settings";
import frontpageShowcase from "./src/sanity/schemas/singletons/showcase";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "./src/sanity/lib/api";

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL =
  process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:3000";

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
      blogPost,
      authors,
      message,

      // Singletons
      frontpageHero,
      frontpageShowcase,
      services,
      fileMeetingMinutes,
      fileOtherDocuments,
      documentMenu,
      settings,

      // Objects
      youtube,
      twitter,
      iconType,
    ],
  },
  plugins: [
    structureTool({
      title: "Innhold",
      structure: pageStructure([
        settings,
        frontpageHero,
        frontpageShowcase,
        services,
        documentMenu,
      ]),
    }),
    singletonPlugin([
      settings.name,
      services.name,
      frontpageHero.name,
      frontpageShowcase.name,
      documentMenu.name,
    ]),

    visionTool({ defaultApiVersion: apiVersion }),

    nbNOLocale(),
    // Presentation tool configuration for Visual Editing
    presentationTool({
      title: "Presentasjon",
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
  ],
});
