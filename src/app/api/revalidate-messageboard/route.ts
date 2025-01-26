import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  try {
    revalidatePath(`/messageboard/${id}`);

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
