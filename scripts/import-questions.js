const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Setup basic environment values for the script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];

  if (!filePath) {
    console.error("Usage: node scripts/import-questions.js <path-to-file.json>");
    process.exit(1);
  }

  const rawData = fs.readFileSync(path.resolve(filePath), 'utf-8');
  const data = JSON.parse(rawData);

  const { subject, year, season, questions } = data;

  if (!subject || !year || !season || !questions) {
    console.error("Invalid JSON format. Require subject, year, season, questions.");
    process.exit(1);
  }

  console.log(`Importing Exam: ${subject} ${season} ${year}`);

  // Upsert Exam
  const { data: examConfig, error: examError } = await supabase
    .from('exams')
    .upsert(
      { subject, year, season },
      { onConflict: 'subject,year,season', ignoreDuplicates: false }
    )
    .select('id')
    .single();

  if (examError || !examConfig) {
    console.error("Failed to upsert exam:", examError);
    process.exit(1);
  }

  const examId = examConfig.id;
  console.log(`Exam ID: ${examId}`);

  let added = 0;
  for (const q of questions) {
    const { error: qError } = await supabase
      .from('questions')
      .upsert(
        {
          exam_id: examId,
          number: q.number,
          content: { text: q.text },
          max_points: q.max_points,
          model_answer: q.model_answer
        },
        { onConflict: 'exam_id,number', ignoreDuplicates: false }
      );

    if (qError) {
      console.error(`Failed to insert question ${q.number}:`, qError);
    } else {
      added++;
    }
  }

  console.log(`Successfully imported ${added} questions.`);
}

main();
