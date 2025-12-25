/**
 * This configuration is used for the standalone Sanity Studio
 */

import { pageStructure, singletonPlugin } from "./plugins/settings";
import authors from "./schemas/documents/authors";
import blogPost from "./schemas/documents/blog";
import fileMeetingMinutes from "./schemas/documents/fileMeetingMinutes";
import fileOtherDocuments from "./schemas/documents/fileOtherDocuments";
import { message } from "./schemas/documents/message";
import page from "./schemas/documents/page";
import { iconType } from "./schemas/objects/icons";
import { twitter } from "./schemas/objects/twitter";
import { youtube } from "./schemas/objects/youtube";
import documentMenu from "./schemas/singletons/documentMenu";
import frontpageHero from "./schemas/singletons/frontpage-hero";
import services from "./schemas/singletons/services";
import settings from "./schemas/singletons/settings";
import frontpageShowcase from "./schemas/singletons/showcase";
import newUserIntro from "./schemas/singletons/newUserIntro";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "./lib/api";
import { bodyText } from "./schemas/objects/bodyText";

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL =
  import.meta.env.VITE_SANITY_STUDIO_PREVIEW_URL || "http://localhost:3000";

export default defineConfig({
  title: `gartnerihagen-askim.no [dataset: ${dataset}]`,
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
      newUserIntro,
      services,
      fileMeetingMinutes,
      fileOtherDocuments,
      documentMenu,
      settings,

      // Objects
      youtube,
      twitter,
      iconType,
      bodyText,
    ],
  },
  plugins: [
    structureTool({
      title: "Innhold",
      structure: pageStructure([
        settings,
        frontpageHero,
        frontpageShowcase,
        newUserIntro,
        services,
        documentMenu,
      ]),
    }),
    singletonPlugin([
      settings.name,
      services.name,
      frontpageHero.name,
      frontpageShowcase.name,
      newUserIntro.name,
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
