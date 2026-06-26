"use server";

export async function verifyFacultyCode(code: string): Promise<boolean> {
  const secret = process.env.FACULTY_SECRET_CODE;
  
  if (!secret) {
    console.error("FACULTY_SECRET_CODE environment variable is not set.");
    return false;
  }

  return code.trim() === secret;
}
