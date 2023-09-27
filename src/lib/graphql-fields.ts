export const BLOGPOSTCOLLECTION_GRAPHQL_FIELDS = `
    total
    items {
      privatePost
      sys {
        id
        publishedAt
        firstPublishedAt
      }
      slug
      title
      excerpt
      featuredImage {
        title
        description
        url(transform: {format: AVIF})
        width
        height
      }
    }
  
`;

export const BLOGPOST_GRAPHQL_FIELDS = `
    total
    items {
      privatePost
      sys {
        id
        publishedAt
        firstPublishedAt
      }
      slug
      title
      excerpt
      bodyText {
        json
        json
        links {
          assets {
            block {
              sys {
                id
              }
              url
              description
              title
              width
              height
            }
          }
        }
      }
      featuredImage {
        title
        description
        url(transform: {format: AVIF})
        width
        height
      }
    }

`;

export const BLOGPOSTROUTES_GRAPHQL_FIELDS = `
  total
`;

export const PAGE_GRAPHQL_FIELDS = `
  pageTitle
      sys {
        id
        publishedAt
        firstPublishedAt
      }
      excerpt
      pageImage {
        title
        description
        width
        height
        url(transform: {
          format:AVIF
        })
      }
      pageText {
        json
        links {
          assets {
            block {
              sys {
                id
              }
              url
              description
              title
              width
              height
            }
          }
        }
      }
    `;

export const SERVICEMENU_GRAPHQL_FIELDS = `
  serviceMenu(id: "3ZMDi88bv5KLPFanE7JxPa") {
    menu1Name: menu1
    menu1File {
      url
    }
    menu2Name: menu2
    menu2File {
      url
    }
    menu3Name: menu3
    menu3File {
      url
    }
    menu4Name: menu4
    menu4File {
      url
    }
    menu5Name: menu5
    menu6Name: menu6
  }
`;

export const DOCUMENTS_MENU5_GRAPHQL_FIELDS = `
serviceMenu(id: "3ZMDi88bv5KLPFanE7JxPa") {
  menu5FilesCollection {
    total
    items {
      sys {
        id
        firstPublishedAt
        publishedAt
      }
      title
      description
      contentType
      fileName
      size
      url
    }
  }
}      
`;
export const DOCUMENTS_MENU6_GRAPHQL_FIELDS = `
serviceMenu(id: "3ZMDi88bv5KLPFanE7JxPa") {
  menu6FilesCollection {
    total
    items {
      sys {
        id
        firstPublishedAt
        publishedAt
      }
      title
      description
      contentType
      fileName
      size
      url
    }
  }
}    
`;
