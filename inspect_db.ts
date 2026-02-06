import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; // Use anon key for reading

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
  "profiles",
  "mentor_mentee",
  "mentor_tasks",
  "task_submissions",
  "task_feedback",
  "subjects",
  "weekly_schedule", // Checking for potential missing tables
  "daily_records", // Checking for potential missing tables
];

async function inspectTables() {
  console.log("--- Inspecting Database Tables ---");
  for (const table of tablesToCheck) {
    console.log(`\nChecking table: ${table}`);
    const { data, error } = await supabase.from(table).select("*").limit(1);

    if (error) {
      console.error(`❌ Error accessing ${table}: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(
        `✅ Table exists. Columns: ${Object.keys(data[0]).join(", ")}`,
      );
    } else {
      console.log(`⚠️ Table exists but is empty (or RLS blocked).`);
    }
  }
}

inspectTables();
