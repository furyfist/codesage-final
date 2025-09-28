import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { Interview } from "@/types/interview";
import { nanoid } from "nanoid";

// This is the final, corrected service layer.
// It is designed to work on the server and avoids the broken database relationship.
export class InterviewService {
  private static supabase: SupabaseClient<Database>;
  private static supabasePublic: SupabaseClient<Database>;

  // This function gets the correct Supabase client:
  // - A powerful "service_role" client for logged-in user actions.
  // - A public "anon" client for anonymous candidate access.
  private static getSupabaseClient(isPublic = false): SupabaseClient<Database> {
    if (isPublic) {
      if (!this.supabasePublic) {
        this.supabasePublic = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
      }
      return this.supabasePublic;
    }

    if (!this.supabase) {
      this.supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    }
    return this.supabase;
  }

  /**
   * Fetches all interviews for the logged-in user's dashboard.
   * THE FIX: It no longer tries to join the broken 'interviewers' table.
   */
  static async getAllInterviews(userId: string, organizationId: string) {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from("interview") // Correct table name
      .select(`*`)      // Select only from the interview table
      .or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in getAllInterviews:", error);
      return [];
    }
    return data || [];
  }

  /**
   * Fetches a single interview for the public candidate link.
   * THE FIX: It uses the public client and no longer joins the broken table.
   */
  static async getInterviewBySlug(slug: string) {
    const supabase = this.getSupabaseClient(true); // Use the public client
    const { data, error } = await supabase
      .from("interview") // Correct table name
      .select(`*`)      // Select only from the interview table
      .eq("readable_slug", slug)
      .single();

    if (error) {
      // This error is now expected if the slug is wrong, it's not a system failure.
      console.error("Error in getInterviewBySlug:", error.message);
      return null;
    }
    return data;
  }

  /**
   * Creates a new interview.
   * THE FIX: It marks the interview as public to solve the security issue.
   */
  static async createInterview(interview: any) {
    const supabase = this.getSupabaseClient();
    // This removes the 'id' if the frontend sends it, letting the DB handle it.
    const { id, ...interviewData } = interview;

    const { data, error } = await supabase
      .from("interview") // Correct table name
      .insert([
        {
          ...interviewData,
          id: nanoid(), // Generate a new unique ID here.
          is_anonymous: true, // This allows public access
        },
      ])
      .select();

    if (error) {
      console.error("Error in createInterview:", error);
      throw new Error(error.message);
    }
    return data;
  }
}