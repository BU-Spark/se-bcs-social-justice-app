import { NextResponse } from "next/server";
import { unjoinCommunity } from "@/lib/actions/community.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { communityId } = body;
    if (!communityId) {
      return NextResponse.json(
        { error: "Missing communityId" },
        { status: 400 }
      );
    }
    await unjoinCommunity(communityId);
    return NextResponse.json(
      { message: "Community unjoined successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unjoining community:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
