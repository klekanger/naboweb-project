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
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { emailTemplate } from "./email-template";
import nodemailer from "nodemailer";
import { SITE_NAME } from "@/lib/constants";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

const redis = Redis.fromEnv();

const transporter = nodemailer.createTransport({
  host: process.env.AWS_SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.AWS_SMTP_USER,
    pass: process.env.AWS_SMTP_PASSWORD,
  },
});

export async function POST() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (authHeader !== `Bearer ${process.env.EMAIL_SECRET_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const overrideDate = headersList.get("overrideDate"); // We can override the last run date to send emails
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({
      error: {
        message: "Failed to send email updates. Missing base URL.",
      },
      status: 500,
    });
  }

  try {
    // Get the last run timestamp, default to 24 hours ago if not found
    const lastRunTime =
      (await redis.get("lastEmailAlertRun")) ||
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Update the last run time immediately
    await redis.set("lastEmailAlertRun", new Date().toISOString());

    // Query for subscribed authors
    const subscribers = await client.fetch(`
      *[_type == "authors" && emailSubscription == true]{
        firstName,
        lastName,
        email
      }
    `);

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
        lastRunTime: overrideDate || lastRunTime,
      },
    );

    // Query for new comments to messages
    const messagesWithNewComments = await client.fetch(
      `*[_type == "message" && comments != null && count(comments) > 0 && dateTime(_updatedAt) > dateTime($lastRunTime)]{
        _id,
        title,
        _createdAt,
        _updatedAt,
        comments[]{
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
      { lastRunTime: overrideDate || lastRunTime },
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
        lastRunTime: overrideDate || lastRunTime,
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
      { lastRunTime: overrideDate || lastRunTime },
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
      { lastRunTime: overrideDate || lastRunTime },
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

    // Filter out subscribers without email addresses
    const validSubscribers = subscribers.filter(
      (subscriber: { email: string | null }) => subscriber.email,
    );

    if (validSubscribers.length === 0) {
      return NextResponse.json({
        success: {
          message: "No subscribers with valid email addresses found.",
        },
        status: 200,
      });
    }

    // Send one email to all subscribers using BCC
    await sendEmail({
      bcc: validSubscribers.map(
        (subscriber: { email: string }) => subscriber.email,
      ),
      subject: `Nytt innhold på nettsidene til ${SITE_NAME}`,
      body: emailContent,
    });

    return NextResponse.json({
      success: {
        message: `Sent email to ${validSubscribers.length} subscribers`,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Failed to send email updates:", error);
    return NextResponse.json({
      error: {
        message: "Failed to send email updates",
        longMessage: error,
      },
      status: 500,
    });
  }
}

// Send email using nodemailer
async function sendEmail({
  bcc,
  subject,
  body,
}: {
  bcc: string[];
  subject: string;
  body: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.AWS_SMTP_FROM_EMAIL,
      to: process.env.AWS_SMTP_FROM_EMAIL, // Send to self
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

// TODO add cron job to trigger this route
