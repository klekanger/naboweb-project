/**
 * This route is used to send email alerts to subscribers.
 * It should be triggered by a cron job.
 *
 * Use "overrideDate" header to override the last run date to send emails
 *
 */

import { apiVersion, dataset, projectId } from "@/sanity/lib/api";
import { createClient } from "@sanity/client";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { emailTemplate } from "./email-template";
import nodemailer from "nodemailer";
import { SITE_NAME } from "@/lib/constants";
import { validateEnvironmentVariables } from "./validateEnvironmentVariables";
import { authorizeEmailAlertsRequest } from "./authorize-email-alerts-request";
import { getClerkEmailSubscribers } from "./get-clerk-email-subscribers";
import {
  buildSanityAuthorEmailSet,
  filterSubscribersWithSanityAuthor,
  SANITY_AUTHOR_EMAILS_QUERY,
} from "./filter-subscribers-with-sanity-author";
import { chunkArray, SES_BCC_RECIPIENT_LIMIT } from "./email-batch";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_VIEWER_TOKEN,
});

const redis = Redis.fromEnv();

function createEmailTransporter(
  envVars: ReturnType<typeof validateEnvironmentVariables>,
) {
  return nodemailer.createTransport({
    host: envVars.AWS_SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: envVars.AWS_SMTP_USER,
      pass: envVars.AWS_SMTP_PASSWORD,
    },
  });
}

async function processEmailAlerts(request: Request) {
  try {
    const envVars = validateEnvironmentVariables();
    const auth = authorizeEmailAlertsRequest(request, {
      emailSecretToken: envVars.EMAIL_SECRET_TOKEN,
      cronSecret: envVars.CRON_SECRET,
    });

    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const overrideDate = auth.isManualAuth
      ? request.headers.get("overrideDate")
      : null;
    const baseUrl = envVars.NEXT_PUBLIC_BASE_URL;

    // Get the last run timestamp, default to 24 hours ago if not found
    const lastRunTime =
      (await redis.get("lastEmailAlertRun")) ||
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const contentLastRunTime = overrideDate || lastRunTime;

    // Query for new bulletin board messages
    const messages = await client.fetch(
      `*[_type == "message" && dateTime(_createdAt) > dateTime($lastRunTime)]{
        title,
        _id,
        _createdAt,
        _updatedAt,
        author->{firstName, lastName},
        comments[]{published, commentTitle, commentAuthor->{
          firstName, 
          lastName
      }}
      }`,
      {
        lastRunTime: contentLastRunTime,
      },
    );

    // Query for new published comments on messages updated since last run
    const messagesWithNewComments = await client.fetch(
      `*[_type == "message" && count(comments[dateTime(_createdAt) > dateTime($lastRunTime) && published == true]) > 0]{
        _id,
        title,
        _createdAt,
        _updatedAt,
        "comments": comments[dateTime(_createdAt) > dateTime($lastRunTime) && published == true]{
          published, 
          commentTitle, 
          commentText,
          _createdAt,
          _updatedAt,
          commentAuthor->{
            firstName, 
            lastName
          }
        }
      }`,
      { lastRunTime: contentLastRunTime },
    );

    // Query for new blog posts
    const posts = await client.fetch(
      `*[_type == "blogPost" && dateTime(_createdAt) > dateTime($lastRunTime)]{
        title,
        excerpt,
        slug,
        privatePost,
        _createdAt,
        _updatedAt
      }`,
      {
        lastRunTime: contentLastRunTime,
      },
    );

    // Query for new meeting minutes
    const fileMeetingMinutes = await client.fetch(
      `*[_type == "fileMeetingMinutes" && dateTime(_updatedAt) > dateTime($lastRunTime)]{
        _id,
        _createdAt,
        _updatedAt,
        title, 
        description,
        meetingDate,
        meetingPlace,
      }`,
      { lastRunTime: contentLastRunTime },
    );

    // Query for new documents
    const fileOtherDocuments = await client.fetch(
      `*[_type == "fileOtherDocuments" && dateTime(_updatedAt) > dateTime($lastRunTime)]{
        _id,
        _createdAt,
        _updatedAt,
        title, 
        description,
        'document': otherDocument{
          asset->{url, _id, originalFilename}
        }
      }`,
      { lastRunTime: contentLastRunTime },
    );

    // Check if there is any new content
    const hasNewContent =
      messages.length > 0 ||
      posts.length > 0 ||
      fileMeetingMinutes.length > 0 ||
      fileOtherDocuments.length > 0 ||
      messagesWithNewComments.length > 0;

    if (!hasNewContent) {
      return NextResponse.json({
        success: {
          message: "No new content since last run.",
        },
        status: 200,
      });
    }

    const emailContent = emailTemplate({
      content: {
        messages,
        posts,
        fileMeetingMinutes,
        fileOtherDocuments,
        messagesWithNewComments,
      },
      baseUrl,
    });

    const clerkSubscribers = await getClerkEmailSubscribers();
    const sanityAuthors = await client.fetch<{ email?: string }[]>(
      SANITY_AUTHOR_EMAILS_QUERY,
    );
    const sanityAuthorEmails = buildSanityAuthorEmailSet(sanityAuthors);
    const subscribers = filterSubscribersWithSanityAuthor(
      clerkSubscribers,
      sanityAuthorEmails,
    );

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: {
          message: "No subscribers matched a Sanity author email.",
        },
        status: 200,
      });
    }

    const transporter = createEmailTransporter(envVars);
    const bccAddresses = subscribers.map((subscriber) => subscriber.email);
    const subject = `Nytt innhold på nettsidene til ${SITE_NAME}`;

    await sendEmailBatched({
      transporter,
      bcc: bccAddresses,
      subject,
      body: emailContent,
      fromEmail: envVars.AWS_SMTP_FROM_EMAIL,
    });

    await redis.set("lastEmailAlertRun", new Date().toISOString());

    return NextResponse.json({
      success: {
        message: `Sent email to ${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}`,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Failed to send email updates:", error);

    // Handle environment validation errors specifically
    if (
      error instanceof Error &&
      error.message.includes("Missing required environment variables")
    ) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to send email updates" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return processEmailAlerts(request);
}

export async function POST(request: Request) {
  return processEmailAlerts(request);
}

async function sendEmailBatched({
  transporter,
  bcc,
  subject,
  body,
  fromEmail,
}: {
  transporter: ReturnType<typeof createEmailTransporter>;
  bcc: string[];
  subject: string;
  body: string;
  fromEmail: string;
}) {
  const bccChunks = chunkArray(bcc, SES_BCC_RECIPIENT_LIMIT);

  for (let index = 0; index < bccChunks.length; index++) {
    const bccChunk = bccChunks[index];
    try {
      await sendEmail({
        transporter,
        bcc: bccChunk,
        subject,
        body,
        fromEmail,
      });
    } catch (error) {
      console.error(
        `Failed to send email alert batch ${index + 1}/${bccChunks.length}:`,
        error,
      );
      throw error;
    }
  }
}

// Send email using nodemailer
async function sendEmail({
  transporter,
  bcc,
  subject,
  body,
  fromEmail,
}: {
  transporter: ReturnType<typeof createEmailTransporter>;
  bcc: string[];
  subject: string;
  body: string;
  fromEmail: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: fromEmail, // Send to self
      bcc, // BCC all subscribers
      subject,
      html: body,
    });

    console.log(`Email sent to ${bcc.length} subscribers: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to subscribers:`, error);
    throw error;
  }
}
