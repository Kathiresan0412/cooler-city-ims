import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const token = process.env.cooler_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("Image storage is not configured", { status: 503 });
  }

  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname || !/^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[^/]+$/i.test(pathname)) {
    return new NextResponse("Invalid image path", { status: 400 });
  }

  try {
    const result = await get(pathname, { access: "private", token });
    if (!result || result.statusCode !== 200) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const contentType = result.blob.contentType;
    if (!allowedTypes.has(contentType)) {
      return new NextResponse("Unsupported image type", { status: 415 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Private product image retrieval failed", error);
    return new NextResponse("Could not retrieve image", { status: 500 });
  }
}
