import { NextResponse } from "next/server";
import { getCaptainsForMatch } from "@/lib/captainPhotos";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get("home")?.trim();
  const away = searchParams.get("away")?.trim();

  if (!home || !away) {
    return NextResponse.json(
      { error: "home and away team names are required" },
      { status: 400 },
    );
  }

  try {
    const captains = await getCaptainsForMatch(home, away);
    return NextResponse.json(captains, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load captain photos" },
      { status: 500 },
    );
  }
}
