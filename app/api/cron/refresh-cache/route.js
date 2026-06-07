import { NextResponse } from "next/server";
import { refreshAllApiCache } from "@/lib/refreshApiCache";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshAllApiCache();
    const ok = result.failed.length === 0;

    return NextResponse.json(
      {
        ok,
        refreshed: result.refreshed,
        failed: result.failed,
        refreshedAt: new Date().toISOString(),
      },
      { status: ok ? 200 : 207 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Cache refresh failed" },
      { status: 500 },
    );
  }
}
