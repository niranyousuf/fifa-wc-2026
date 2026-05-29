import { NextResponse } from "next/server";
import { getStandings } from "@/lib/api";

export async function GET() {
  try {
    const standings = await getStandings();
    return NextResponse.json(standings);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch standings" },
      { status: 500 },
    );
  }
}
