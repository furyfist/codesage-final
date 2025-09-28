import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { InterviewService } from "@/services/interviews.service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    logger.info("create-interview request received", body);

    const payload = body.interviewData;
    let readableSlug: string;

    // THIS IS THE UNBREAKABLE SLUG GENERATION. IT IS ALWAYS UNIQUE.
    if (payload.name) {
      const interviewNameSlug = payload.name.toLowerCase().replace(/\s+/g, "-");
      readableSlug = `${interviewNameSlug}-${nanoid(6)}`; // e.g., final-test-aB5xP1
    } else {
      readableSlug = nanoid(10); // Fallback to a completely random slug
    }

    const newInterviewData = {
      ...payload,
      readable_slug: readableSlug,
    };

    const newInterview = await InterviewService.createInterview(newInterviewData);

    logger.info("Interview created successfully", newInterview);

    return NextResponse.json(
      {
        response: "Interview created successfully",
        interview: newInterview,
      },
      { status: 200 }
    );
  } catch (err: any) {
    logger.error("Error creating interview", { error: err.message });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}