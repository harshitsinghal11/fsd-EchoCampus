import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure required env vars are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
  console.error("Missing required environment variables. Make sure to run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

async function main() {
  console.log("Starting knowledge ingestion...");

  // 1. Fetch Faculty Profiles
  console.log("Fetching faculty profiles...");
  const { data: facultyData, error: facultyError } = await supabase
    .from("users")
    .select(`
      id,
      full_name,
      email,
      faculty_profiles (
        department,
        cabin,
        phone,
        experience_years
      )
    `)
    .eq("role", "admin"); // Faculty have role 'admin' in this system

  if (facultyError) {
    console.error("Error fetching faculty:", facultyError);
    return;
  }

  const facultyRecords = facultyData.map((user: any) => {
    const profile = Array.isArray(user.faculty_profiles) ? user.faculty_profiles[0] : user.faculty_profiles;
    return {
      id: user.id,
      type: "faculty_profile",
      content: `Faculty Name: ${user.full_name}\nEmail: ${user.email}\nDepartment: ${profile?.department || 'N/A'}\nCabin: ${profile?.cabin || 'N/A'}\nPhone: ${profile?.phone || 'N/A'}\nExperience: ${profile?.experience_years ?? 'N/A'} years.`,
      metadata: { userId: user.id, name: user.full_name, department: profile?.department }
    };
  });

  // 2. Fetch Announcements
  console.log("Fetching announcements...");
  const { data: announcementData, error: announcementError } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      content,
      created_at,
      author_id,
      users ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(50); // Get latest 50

  if (announcementError) {
    console.error("Error fetching announcements:", announcementError);
    return;
  }

  const announcementRecords = announcementData.map((ann: any) => {
    const authorName = ann.users?.full_name || "Unknown Author";
    return {
      id: ann.id,
      type: "announcement",
      content: `Announcement: ${ann.title}\nBy: ${authorName}\nDate: ${new Date(ann.created_at).toLocaleDateString()}\nContent: ${ann.content}`,
      metadata: { announcementId: ann.id, title: ann.title, author: authorName }
    };
  });

  const allRecords = [...facultyRecords, ...announcementRecords];
  console.log(`Found ${facultyRecords.length} faculty and ${announcementRecords.length} announcements.`);

  // 3. Generate embeddings and insert
  for (const record of allRecords) {
    console.log(`Processing: ${record.type} - ${(record.metadata as any).name || (record.metadata as any).title}`);
    try {
      const embedding = await generateEmbedding(record.content);

      // Upsert into campus_knowledge (we'll just insert for simplicity in this script)
      // Note: Ideally you'd delete old ones or check if they exist, but for a one-off script insert is fine.
      const { error: insertError } = await supabase
        .from("campus_knowledge")
        .insert({
          content: record.content,
          metadata: { ...record.metadata, source_type: record.type },
          embedding: embedding
        });

      if (insertError) {
        console.error(`Error inserting ${record.id}:`, insertError);
      }
    } catch (e) {
      console.error(`Failed to embed ${record.id}:`, e);
    }
  }

  console.log("Knowledge ingestion complete!");
}

main().catch(console.error);
