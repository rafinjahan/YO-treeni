import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');
  const examId = searchParams.get('examId');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let query = supabase
    .from('questions')
    .select(`
      id,
      number,
      content,
      max_points,
      exam_id,
      exams!inner (
        subject,
        year,
        season
      )
    `)
    .limit(limit);

  if (subject) {
    query = query.eq('exams.subject', subject);
  }
  
  if (examId) {
    query = query.eq('exam_id', examId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questions: data });
}
