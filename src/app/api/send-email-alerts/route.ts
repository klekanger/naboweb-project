/**
 * This route is used to send email alerts to subscribers.
 * It should be triggered by a cron job.
 *
 * Use "overrideDate" header to override the last run date to send emails
 *
 */

import { createClient } from "@sanity/client";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { apiVersion, dataset, projectId } from "@/sanity/env";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

const redis = Redis.fromEnv();

export async function POST() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (authHeader !== `Bearer ${process.env.EMAIL_SECRET_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const overrideDate = headersList.get("overrideDate"); // We can override the last run date to send emails

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
        author,
      }`,
      {
        lastRunTime: overrideDate || lastRunTime,
      },
    );

    // Query for new blog posts
    const posts = await client.fetch(
      `*[_type == "blogPost" && dateTime(_createdAt) > dateTime($lastRunTime)]{
        title,
        excerpt,
        slug,
      }`,
      {
        lastRunTime: overrideDate || lastRunTime,
      },
    );

    // Query for new meeting minutes
    const fileMeetingMinutes = await client.fetch(
      `*[_type == "fileMeetingMinutes" && dateTime(_updatedAt) > dateTime($lastRunTime)]{
      _createdAt,
      _updatedAt,
      title, 
      description,
      }`,
      { lastRunTime: overrideDate || lastRunTime },
    );

    // Query for new documents
    const fileOtherDocuments = await client.fetch(
      `*[_type == "fileOtherDocuments" && dateTime(_updatedAt) > dateTime($lastRunTime)]{
      _createdAt,
      _updatedAt,
      title, 
      description,
      }`,
      { lastRunTime: overrideDate || lastRunTime },
    );

    console.log("messages", messages);
    console.log("posts", posts);
    console.log("fileMeetingMinutes", fileMeetingMinutes);
    console.log("fileOtherDocuments", fileOtherDocuments);

    // Send email to each subscriber
    for (const subscriber of subscribers) {
      if (!subscriber.email) continue;

      // Here you would integrate with your email service of choice
      // Example with a hypothetical email service:
      await sendEmail({
        to: subscriber.email,
        subject: "New Content Update",
        body: `Hello ${subscriber.firstName},\n\nThere's new content available...`,
      });
    }

    return NextResponse.json({
      success: {
        message: `Sent emails to ${subscribers.length} subscribers`,
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

// Example email sending function - replace with your actual email service
async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  // Implement  email sending logic here

  console.log(`Sending email to ${to}`);
}

// TODO add email sending logic
// TODO add cron job to trigger this route
// TODO add email sending logic
