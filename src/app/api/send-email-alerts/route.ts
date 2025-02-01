/**
 * This route is used to send email alerts to subscribers.
 * It should be triggered by a cron job.
 */

import { createClient } from "@sanity/client";
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

export async function POST() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (authHeader !== `Bearer ${process.env.EMAIL_SECRET_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Query for subscribed authors
    const subscribers = await client.fetch(`
      *[_type == "authors" && emailSubscription == true]{
        firstName,
        lastName,
        email
      }
    `);

    // Query for new bulletin board messages
    const messages =
      await client.fetch(`*[_type == "message" && dateTime(_createdAt) > dateTime(now()) - 60*60*24]{
        title,
        _id,
        author,
      }`);

    // Query for new posts
    const posts =
      await client.fetch(`*[_type == "blogPost" && dateTime(_createdAt) > dateTime(now()) - 60*60*24]{
      title,
      excerpt,
      slug
    }`);

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
  // Implement your email sending logic here
  // You could use services like SendGrid, AWS SES, Nodemailer, etc.
  console.log(`Sending email to ${to}`);
}

// TODO add email sending logic
// TODO add cron job to trigger this route
// TODO add email sending logic
// TODO add cron job to trigger this route
// TODO add error handling
