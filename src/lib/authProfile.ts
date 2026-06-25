import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { generateUniqueCode } from "@/utils/generateUniqueCode";

export type AppRole = "student" | "faculty" | "admin";

type AuthUserLike = Pick<User, "id" | "email" | "user_metadata">;

export async function ensureOwnUserRow(user: AuthUserLike) {
  // The PostgreSQL trigger 'handle_new_auth_user' automatically inserts the user row
  // This function just serves as a verification that the row exists
  const { data: existingRow, error: fetchError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }
}

export async function fetchUserRole(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data?.role) {
    throw new Error("User profile not found. Please contact support.");
  }

  return data.role as AppRole;
}

export async function ensureStudentSessionCode(userId: string) {
  const { data: profile, error: fetchError } = await supabase
    .from("student_profiles")
    .select("session_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (profile?.session_code) {
    return profile.session_code;
  }

  const newCode = generateUniqueCode(7);
  const { error: insertError } = await supabase.from("student_profiles").insert({
    user_id: userId,
    session_code: newCode,
  });

  if (insertError && insertError.code !== "23505") {
    throw insertError;
  }

  if (!insertError) {
    return newCode;
  }

  const { data: insertedProfile, error: retryError } = await supabase
    .from("student_profiles")
    .select("session_code")
    .eq("user_id", userId)
    .single();

  if (retryError) {
    throw retryError;
  }

  return insertedProfile.session_code;
}
