/**
 * This configuration is used for the standalone Sanity Studio
 */

import {pageStructure, singletonPlugin} from './plugins/settings'
import authors from './schemaTypes/documents/authors'
import blogPost from './schemaTypes/documents/blog'
import fileMeetingMinutes from './schemaTypes/documents/fileMeetingMinutes'
import fileOtherDocuments from './schemaTypes/documents/fileOtherDocuments'
import {message} from './schemaTypes/documents/message'
import page from './schemaTypes/documents/page'
import {iconType} from './schemaTypes/objects/icons'
import {twitter} from './schemaTypes/objects/twitter'
import {youtube} from './schemaTypes/objects/youtube'
import documentMenu from './schemaTypes/singletons/documentMenu'
import frontpageHero from './schemaTypes/singletons/frontpage-hero'
import services from './schemaTypes/singletons/services'
import settings from './schemaTypes/singletons/settings'
import frontpageShowcase from './schemaTypes/singletons/showcase'
import newUserIntro from './schemaTypes/singletons/newUserIntro'
import {nbNOLocale} from '@sanity/locale-nb-no'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './lib/api'
import {bodyText} from './schemaTypes/objects/bodyText'

const SANITY_STUDIO_PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

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
      title: 'Innhold',
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

    visionTool({defaultApiVersion: apiVersion}),

    nbNOLocale(),
    // Presentation tool configuration for Visual Editing
    presentationTool({
      title: 'Presentasjon',
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        preview: '/',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
  ],
})
