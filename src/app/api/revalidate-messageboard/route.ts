import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // revalidate "/messageboard"
    console.log("[revalidate-messageboard] Revalidating...");
    revalidatePath("/messageboard");
    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
    });
  } catch (error: any) {
    console.error("Something went wrong:", error);
    return new Response(error.message, { status: 500 });
  }
}
