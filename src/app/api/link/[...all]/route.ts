import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { all: string[] } },
) {
  // Your logic here
  return NextResponse.json({ message: "Link opened!", params });
}
