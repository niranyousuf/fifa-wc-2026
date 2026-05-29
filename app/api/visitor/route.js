import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const visitorsPath = path.join(process.cwd(), "data", "visitors.json");

function readCount() {
  if (!fs.existsSync(visitorsPath)) {
    fs.mkdirSync(path.dirname(visitorsPath), { recursive: true });
    fs.writeFileSync(visitorsPath, JSON.stringify({ count: 0 }, null, 2));
  }

  const raw = fs.readFileSync(visitorsPath, "utf8");
  const data = JSON.parse(raw);
  return Number.isFinite(data.count) ? data.count : 0;
}

function writeCount(count) {
  fs.writeFileSync(visitorsPath, JSON.stringify({ count }, null, 2));
}

export async function GET() {
  try {
    return NextResponse.json({ count: readCount() });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to read visitor count" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const nextCount = readCount() + 1;
    writeCount(nextCount);
    return NextResponse.json({ count: nextCount });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to increment visitor count" },
      { status: 500 },
    );
  }
}
