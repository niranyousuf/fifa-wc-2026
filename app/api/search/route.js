import { NextResponse } from "next/server";
import { searchTeams } from "@/lib/api";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const teams = await searchTeams(query);
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to search teams" },
      { status: 500 },
    );
  }
}
