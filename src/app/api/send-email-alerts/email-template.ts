import { SITE_NAME } from "@/lib/constants";
import { PortableTextBlock } from "@portabletext/types";
import { toPlainText } from "@portabletext/react";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Helper function to sanitize user-generated content
const sanitizeHtml = (str: string | null | undefined): string => {
  if (!str) return "";
  return DOMPurify.sanitize(str, {
    ALLOWED_TAGS: [], // Only allow text, strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    WHOLE_DOCUMENT: false,
  });
};

export interface Content {
  messages: {
    title: string;
    _id: string;
    _createdAt: string;
    _updatedAt: string;
    author: {
      firstName: string;
      lastName: string;
    };
  }[];
  messagesWithNewComments: {
    _id: string;
    title: string;
    _createdAt: string;
    _updatedAt: string;
    comments: {
      commentTitle: string;
      commentText: string;
      _createdAt: string;
      _updatedAt: string;
      commentAuthor: {
        firstName: string;
        lastName: string;
      };
    }[];
  }[];
  posts: {
    title: string;
    excerpt?: PortableTextBlock[];
    slug: any;
    privatePost: boolean;
    _createdAt: string;
    _updatedAt: string;
  }[];
  fileMeetingMinutes: {
    _id: string;
    title: string;
    description?: string;
    _createdAt: string;
    _updatedAt: string;
    meetingDate: string;
    meetingPlace: string;
  }[];
  fileOtherDocuments: {
    _id: string;
    title: string;
    description?: string;
    _createdAt: string;
    _updatedAt: string;
    document: {
      asset: {
        url: string | null;
        _id: string;
        originalFilename: string | null;
      } | null;
    };
  }[];
}

export const emailTemplate = ({
  content,
  baseUrl,
}: {
  content: Content;
  baseUrl: string;
}) => {
  const {
    messages = [],
    posts = [],
    fileMeetingMinutes = [],
    fileOtherDocuments = [],
    messagesWithNewComments = [],
  } = content;

  const commentsWithParentId = messagesWithNewComments.flatMap((message) =>
    message.comments.map((comment) => ({
      ...comment,
      parentMessageId: message._id,
      parentMessageTitle: message.title,
    })),
  );

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        .email-container {
          max-width: 750px;
          width: 100%;
          margin: 0 auto;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 10px;
          box-sizing: border-box;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e9ecef;
        }
        .header h1 {
          margin: 0 0 15px 0;
          color: #1a1a1a;
          font-size: clamp(18px, 5vw, 24px);
          line-height: 1.3;
          word-wrap: break-word;
        }
        .header p {
          margin: 8px 0;
          color: #4a5568;
          font-size: clamp(14px, 4vw, 16px);
        }
        .content {
          background-color: #ffffff;
          padding: 15px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .section {
          margin-bottom: 30px;
          background-color: #ffffff;
          border-radius: 8px;
          width: 100%;
        }
        .section:last-child {
          margin-bottom: 0;
        }
        .section-title {
          font-size: clamp(22px, 7vw, 30px);
          font-weight: 900;
          color: #005600;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e9ecef;
          word-wrap: break-word;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 8px #e3e6f3;
        }
        .item {
          margin-bottom: 15px;
          padding: 12px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          transition: background-color 0.2s ease;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .item:hover {
          background-color: #f1f3f5;
        }
        .item:last-child {
          margin-bottom: 0;
        }
        .item-title {
          font-weight: bold;
          color: #1a202c;
          font-size: clamp(15px, 4vw, 16px);
          margin-bottom: 5px;
          word-wrap: break-word;
        }
        .item-title-light {
          font-weight: normal;
          color: #1a202c;
          font-size: clamp(15px, 4vw, 16px);
          margin-bottom: 5px;
          word-wrap: break-word;
        }
        .item-subtitle {
          font-size: clamp(14px, 3.5vw, 15px);
          color: #1a202c;
          margin-top: 5px;
          font-weight: bold;
        }
        .item-meta {
          font-size: clamp(13px, 3.5vw, 14px);
          color: #718096;
          margin-top: 5px;
        }
        .item-byline {
        font-size: clamp(13px, 3.5vw, 14px);
        color: #718096;
        margin-top: 1.5rem;
        font-style: italic;
      }
        .item-text {
          margin-top: 10px;
          color: #4a5568;
          font-size: clamp(14px, 3.8vw, 15px);
          line-height: 1.5;
          word-wrap: break-word;
        }

        @media screen and (max-width: 480px) {
          .email-container {
            padding: 5px;
            max-width: 100%;
            width: 100%;
          }
          .header {
            padding: 15px;
          }
          .content {
            padding: 10px;
          }
          .item {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 style="margin: 0; color: #212529;">Nytt innhold er publisert på nettsiden til ${SITE_NAME}</h1>
        <p>Her kommer en oversikt over nytt innhold som er publisert.</p>
        <p>Hvis du ikke ønsker å motta disse varslingene, logg deg inn på <a href="${process.env.NEXT_PUBLIC_BASE_URL}/min-side">Min side</a> og skru av e-post-varsling. Du kan også
        ta kontakt med styret.</p>
        </div>
        <div class="content">
          ${
            messages.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">📝 Nye innlegg på oppslagstavlen</h2>
            ${messages
              .map(
                (message) => `
              <div class="item">
                <a href="${baseUrl}/messageboard/${message._id}" style="text-decoration: none; color: inherit;">
                  <div class="item-title">${sanitizeHtml(message.title)}</div> 
                  <div class="item-byline">
                    <span>Av: ${sanitizeHtml(message.author?.firstName)} ${sanitizeHtml(message.author?.lastName) || "-"}</span>
                    <span> | ${new Date(message._createdAt).toLocaleDateString("nb-NO")}</span>
                  </div>
                </a>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            commentsWithParentId.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">💬 Nye kommentarer</h2>
            ${commentsWithParentId
              .map(
                (comment) => `
              <div class="item">
                <a href="${baseUrl}/messageboard/${comment.parentMessageId}" style="text-decoration: none; color: inherit;">
                <div class="item-title">Kommentar til: <span class="item-title-light">${sanitizeHtml(comment.parentMessageTitle)}</span></div>
                <div class="item-subtitle">${sanitizeHtml(comment.commentTitle)}</div>
                  <div class="item-text">${sanitizeHtml(comment.commentText)}</div>
                  <div class="item-byline">
                    <span>Av: ${sanitizeHtml(comment.commentAuthor?.firstName)} ${sanitizeHtml(comment.commentAuthor?.lastName)}</span>
                    <span> | ${new Date(comment._createdAt).toLocaleDateString("nb-NO")}</span>
                  </div>
                </a>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            posts.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">👩‍💻 Nye blogginnlegg</h2>
            ${posts
              .map(
                (post) => `
              <div class="item">
                <a href="${baseUrl}${post.privatePost ? `/information/post/${post.slug.current}` : `/blog/${post.slug.current}`}" style="text-decoration: none; color: inherit;">
                  <div class="item-title">${sanitizeHtml(post.title)}</div>
                  ${post.excerpt ? `<div class="item-meta">${sanitizeHtml(toPlainText(post.excerpt))}</div>` : ""}
                  <div class="item-byline">
                    <span>Opprettet: ${new Date(post._createdAt).toLocaleDateString("nb-NO")}</span>
                  </div>
                </a>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            fileMeetingMinutes.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">📂 Nye møtereferater</h2>
            ${fileMeetingMinutes
              .map(
                (meeting) => `
              <div class="item">
                <a href="${baseUrl}/information/referater/${meeting._id}" style="text-decoration: none; color: inherit;">
                  <div class="item-title">${sanitizeHtml(meeting.title)} | ${new Date(meeting.meetingDate).toLocaleDateString("nb-NO")} | ${sanitizeHtml(meeting.meetingPlace)}</div>
                  ${meeting.description ? `<div class="item-meta">${sanitizeHtml(meeting.description)}</div>` : ""}
                  <div class="item-byline">
                    <span>Oppdatert: ${new Date(meeting._updatedAt).toLocaleDateString("nb-NO")}</span>
                  </div>
                </a>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            fileOtherDocuments.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">📄 Nye dokumenter</h2>
            ${fileOtherDocuments
              .map(
                (file) => `
              <div class="item">
                <a href="${file.document?.asset?.url || ""}" style="text-decoration: none; color: inherit;">
                 <div class="item-title">${sanitizeHtml(file.title)}</div>
                ${file.description ? `<div class="item-meta">${sanitizeHtml(file.description)}</div>` : ""}
                  <div class="item-byline">
                   <span>Oppdatert: ${new Date(file._updatedAt).toLocaleDateString("nb-NO")}</span>
                  </div>
                </a>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>
      </div>
    </body>
  </html>
`;
};
