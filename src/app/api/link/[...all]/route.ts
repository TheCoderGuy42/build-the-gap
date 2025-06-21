import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params : Promise<{ all: string[] }> },
) {


  const resolvedParams = await params;
  // Your logic here
  return NextResponse.json({ message: "Link opened!", resolvedParams });
}
