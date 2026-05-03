import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { generateUniqueCode } from "@/utils/generateUniqueCode";

export type AppRole = "student" | "faculty" | "admin";

type AuthUserLike = Pick<User, "id" | "email" | "user_metadata">;
type FacultyDirectoryRow = {
  id: string;
  name: string;
  department: string | null;
  phone_no: string | null;
  cabin_no: string | null;
  experience: number | null;
};

function getFallbackFullName(user: AuthUserLike) {
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  if (metadataName) {
    return metadataName;
  }

  return user.email?.split("@")[0] ?? null;
}

async function findFacultyDirectoryMatch(email: string) {
  const { data, error } = await supabase
    .from("directory")
    .select("id, name, department, phone_no, cabin_no, experience")
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as FacultyDirectoryRow | null) ?? null;
}

async function ensureFacultyRecords(
  userId: string,
  directoryRow: FacultyDirectoryRow
) {
  const { error: profileError } = await supabase.from("faculty_profiles").upsert(
    {
      user_id: userId,
      department: directoryRow.department,
      phone_no: directoryRow.phone_no,
      cabin_no: directoryRow.cabin_no,
      experience_years: directoryRow.experience,
    },
    { onConflict: "user_id" }
  );

  if (
    profileError &&
    profileError.code !== "23505" &&
    profileError.code !== "42501"
  ) {
    throw profileError;
  }

  const { error: mappingError } = await supabase.from("faculty_users").upsert(
    {
      user_id: userId,
      faculty_id: directoryRow.id,
    },
    { onConflict: "user_id" }
  );

  if (
    mappingError &&
    mappingError.code !== "23505" &&
    mappingError.code !== "42501"
  ) {
    throw mappingError;
  }
}

export async function ensureOwnUserRow(user: AuthUserLike) {
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Authenticated user email is unavailable.");
  }

  const { data: existingRow, error: fetchError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existingRow) {
    if (existingRow.role === "faculty") {
      const directoryRow = await findFacultyDirectoryMatch(normalizedEmail);
      if (directoryRow) {
        await ensureFacultyRecords(user.id, directoryRow);
      }
    }
    return;
  }

  const directoryRow = await findFacultyDirectoryMatch(normalizedEmail);
  const role = directoryRow ? "faculty" : "student";

  const { error: insertError } = await supabase.from("users").insert({
    id: user.id,
    email: normalizedEmail,
    full_name: directoryRow?.name ?? getFallbackFullName(user),
    role,
  });

  if (insertError && insertError.code !== "23505") {
    throw insertError;
  }

  if (directoryRow) {
    await ensureFacultyRecords(user.id, directoryRow);
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
