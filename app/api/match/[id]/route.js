import { NextResponse } from "next/server";
import { getMatch } from "@/lib/api";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const data = await getMatch(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch match" },
      { status: 500 },
    );
  }
}
