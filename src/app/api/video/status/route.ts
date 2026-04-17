import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBunnyVideo } from "@/lib/bunny";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const videoId = request.nextUrl.searchParams.get("videoId");
    if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

    const video = await getBunnyVideo(videoId);

    // If encoding finished, update lecture duration
    if (video.status === 3 && video.length > 0) {
      const lectureId = request.nextUrl.searchParams.get("lectureId");
      if (lectureId) {
        await supabase
          .from("lectures")
          .update({ duration_seconds: video.length })
          .eq("id", lectureId)
          .eq("video_bunny_id", videoId);
      }
    }

    return NextResponse.json({
      status: video.status,
      encodeProgress: video.encodeProgress,
      duration: video.length,
      ready: video.status === 3 || video.status === 5,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}