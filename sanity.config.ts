"use client";

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { pageStructure, singletonPlugin } from "@/sanity/plugins/settings";
import authors from "@/sanity/schemas/documents/authors";
import blogPost from "@/sanity/schemas/documents/blog";
import fileMeetingMinutes from "@/sanity/schemas/documents/fileMeetingMinutes";
import fileOtherDocuments from "@/sanity/schemas/documents/fileOtherDocuments";
import { message } from "@/sanity/schemas/documents/message";
import page from "@/sanity/schemas/documents/page";
import { iconType } from "@/sanity/schemas/objects/icons";
import { twitter } from "@/sanity/schemas/objects/twitter";
import { youtube } from "@/sanity/schemas/objects/youtube";
import documentMenu from "@/sanity/schemas/singletons/documentMenu";
import frontpageHero from "@/sanity/schemas/singletons/frontpage-hero";
import services from "@/sanity/schemas/singletons/services";
import settings from "@/sanity/schemas/singletons/settings";
import frontpageShowcase from "@/sanity/schemas/singletons/showcase";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "@/sanity/env";

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
    presentationTool({
      previewUrl: {
        draftMode: {
          enable: "/api/draft",
        },
      },
    }),
  ],
});
