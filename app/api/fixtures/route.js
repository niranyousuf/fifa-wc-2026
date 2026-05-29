import { NextResponse } from "next/server";
import { getFixtures } from "@/lib/api";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const fixtures = await getFixtures({ status });
    return NextResponse.json(fixtures);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch fixtures" },
      { status: 500 },
    );
  }
}
