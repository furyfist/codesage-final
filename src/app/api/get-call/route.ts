import { NextResponse } from "next/server";
import { InterviewService } from "@/services/interviews.service";

// This is a clean, simple API route. Its only job is to call our new service.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const interviewId = searchParams.get("interviewId");

  if (!interviewId) {
    return NextResponse.json(
      { error: "Interview ID is required" },
      { status: 400 }
    );
  }

  try {
    const interviewData = await InterviewService.getInterviewBySlug(interviewId);
    if (!interviewData) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(interviewData);
  } catch (error) {
    return NextResponse.json(
      { error: "An internal error occurred" },
      { status: 500 }
    );
  }
}