import { NextResponse } from "next/server";
import { getTeam } from "@/lib/api";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const data = await getTeam(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch team" },
      { status: 500 },
    );
  }
}
