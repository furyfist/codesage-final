"use server"; 

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { Interview } from "@/types/interview";

// This function now lives in a dedicated, reusable file.
export async function getCall(interviewId: string) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: interview, error } = await supabase
      .from("interviews")
      .select(
        `*,
        interviewers (
          *
        )
      `
      )
      .eq("id", interviewId)
      .single();

    if (error) {
      throw error;
    }
    return interview as unknown as Interview;
  } catch (error) {
    console.error("Error fetching call:", error);
    return null;
  }
}
