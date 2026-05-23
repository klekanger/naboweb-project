/** Base URL and deep links for Sanity Studio (sameiet). */
export const SANITY_STUDIO_BASE_URL = "https://gartnerihagen.sanity.studio/";
const SANITY_STUDIO_FILE_DOCUMENTS_PATH =
  "structure/fileOtherDocuments";

function getSanityStudioFileDocumentsUrl() {
  return `${SANITY_STUDIO_BASE_URL.replace(/\/$/, "")}/${SANITY_STUDIO_FILE_DOCUMENTS_PATH}`;
}
