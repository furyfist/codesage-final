import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  logger.info("register-call request received");

  try {
    const body = await req.json();
    logger.info("Request body:", body);

    const interviewerId = body.interviewer_id;
    
    if (!interviewerId) {
      logger.error("Missing interviewer_id in request body");
      return NextResponse.json(
        { error: "interviewer_id is required" },
        { status: 400 }
      );
    }

    const interviewer = await InterviewerService.getInterviewer(Number(interviewerId));
    logger.info("Fetched interviewer:", interviewer);

    if (!interviewer || !interviewer.agent_id) {
      logger.error("Interviewer not found or missing agent_id");
      return NextResponse.json(
        { error: "Interviewer not found or missing agent_id" },
        { status: 404 }
      );
    }

    const registerCallResponse = await retellClient.call.createWebCall({
      agent_id: interviewer.agent_id,
      retell_llm_dynamic_variables: body.dynamic_data || {},
    });

    logger.info("Call registered successfully:", registerCallResponse);

    return NextResponse.json(
      {
        registerCallResponse,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in register-call:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
