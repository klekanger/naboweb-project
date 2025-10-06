import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// GET: Ping Upstash Redis to keep it alive and avoid deletion on free plan
export async function GET() {
  try {
    await redis.ping();
    return NextResponse.json({
      success: true,
      message: "Redis ping successful",
    });
  } catch (error) {
    console.error("Redis ping failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
