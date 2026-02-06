import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getMentorId() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "mentor")
    .limit(1);

  if (error) {
    console.error(error);
  } else {
    console.log("Mentor:", data?.[0]);
  }
}

getMentorId();
