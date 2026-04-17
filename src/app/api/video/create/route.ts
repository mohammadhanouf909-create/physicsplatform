import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBunnyVideo } from "@/lib/bunny";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["admin", "instructor", "assistant"].includes(profile?.role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, lectureId, courseId } = await request.json();
    if (!title || !lectureId || !courseId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Create video in Bunny
    const video = await createBunnyVideo(title);

    // Store the Bunny video ID on the lecture immediately
    await supabase
      .from("lectures")
      .update({ video_bunny_id: video.guid })
      .eq("id", lectureId);

    return NextResponse.json({
      videoId: video.guid,
      libraryId: process.env.BUNNY_LIBRARY_ID,
      apiKey: process.env.BUNNY_API_KEY,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}