const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load env vars
const envLocalPath = path.resolve(__dirname, "../.env.local");
const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function checkDates() {
  console.log("--- Debugging Date Logic ---");

  // 1. Server Time
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  console.log(`Server Time (new Date()): ${today.toISOString()}`); // UTC usually
  console.log(`Generated todayStr: ${todayStr}`);

  // 2. Fetch Tasks
  const { data: tasks, error } = await supabase
    .from("planner_tasks")
    .select("id, title, date, completed, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching tasks:", error);
    return;
  }

  console.log(`fetched ${tasks.length} tasks.`);

  // 3. Compare
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  console.log(`Tasks matching todayStr (${todayStr}): ${todayTasks.length}`);

  tasks.forEach((t) => {
    const isMatch = t.date === todayStr;
    console.log(
      `[${t.id}] Date: "${t.date}" | Match? ${isMatch} | Title: ${t.title}`,
    );
  });
}

checkDates();
