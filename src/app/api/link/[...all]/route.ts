import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { all: string[] } }) {
  // Your logic here
  return NextResponse.json({ message: "Link opened!", params });
}

export const staticLink = (slug: string) => {
    const link = `/api/link/${slug}`;
    console.log("staticLink", slug, link);
    return link;
}
