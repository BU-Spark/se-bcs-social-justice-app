import { NextResponse } from "next/server";
import { joinCommunity } from "@/lib/actions/community.actions";

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
    await joinCommunity(communityId);
    return NextResponse.json(
      { message: "Community joined successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining community:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
