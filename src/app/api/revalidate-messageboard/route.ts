import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    // Construct and validate the path
    const path = `/messageboard/${id}`;
    if (path.length >= 1024) {
      return Response.json(
        {
          revalidated: false,
          now: Date.now(),
          message: "Path exceeds maximum length of 1024 characters",
        },
        { status: 400 },
      );
    }

    // Revalidate the path
    revalidatePath(path);

    return Response.json(
      {
        revalidated: true,
        now: Date.now(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Revalidation error:", error);
    return Response.json(
      {
        revalidated: false,
        now: Date.now(),
        message: "Failed to revalidate path",
      },
      { status: 500 },
    );
  }
}
