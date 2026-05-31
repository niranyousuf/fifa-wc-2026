import { NextResponse } from "next/server";
import { getVisitorCount, incrementVisitorCount } from "@/lib/visitorCount";

export const runtime = "nodejs";

export async function GET() {
  try {
    const count = await getVisitorCount();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to read visitor count" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const count = await incrementVisitorCount();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to increment visitor count" },
      { status: 500 },
    );
  }
}
