import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteBunnyVideo } from "@/lib/bunny";

export async function DELETE(request: NextRequest) {
  try {
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

    const { videoId, lectureId } = await request.json();
    if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

    await deleteBunnyVideo(videoId);

    if (lectureId) {
      await supabase
        .from("lectures")
        .update({ video_bunny_id: null, video_url: null, duration_seconds: null })
        .eq("id", lectureId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}