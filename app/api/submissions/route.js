import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateFeedback } from '@/lib/ai';

import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Luvaton selainistunto.' }, { status: 401 });
    }
    
    const { subject, mode, answers } = await request.json();
    const activeUserId = user.id;
    
    // answers is array of { questionId, content }
    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: 'Missing vital submission data' }, { status: 400 });
    }

    // Synchronize public.users with auth.users to satisfy Foreign Keys without triggers
    await supabase.from('users').upsert({
       id: activeUserId,
       email: user.email || `student-${activeUserId.slice(0,5)}@yotreeni.fi`,
       name: user.user_metadata?.full_name || 'YO-Treeni Student'
    }, { onConflict: 'id' });

    // 1. Identify valid Exam Context
    const { data: qData } = await supabase.from('questions').select('exam_id').eq('id', answers[0].questionId).single();
    if (!qData) throw new Error("Invalid question ID constraint mapped.");
    
    const examId = qData.exam_id;
    
    // 2. Establish Finalized Exam Session
    const { data: session } = await supabase
      .from('exam_sessions')
      .insert({
        user_id: activeUserId,
        exam_id: examId,
        mode: mode || 'mock',
        finished_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (!session) throw new Error("Could not construct database session");

    // 3. Batch Process AI Grading and Formulate Returns
    let totalScore = 0;
    const finalFeedbacks = {}; 
    const answerInserts = [];

    for (let ans of answers) {
       if (!ans.content || ans.content.trim() === "") continue;

       // Load model answers from exact question
       const { data: ctx } = await supabase.from('questions').select('content, max_points, model_answer').eq('id', ans.questionId).single();
       if (!ctx) continue;

       // Procure AI grading response securely
       const aiFeedback = await generateFeedback({
         question: ctx.content.text,
         studentAnswer: ans.content,
         modelAnswer: ctx.model_answer || "",
         maxPoints: ctx.max_points,
         subject: subject || "general"
       });

       totalScore += aiFeedback.score;
       finalFeedbacks[ans.questionId] = aiFeedback;

       answerInserts.push({
         session_id: session.id,
         question_id: ans.questionId,
         content: ans.content,
         ai_feedback: aiFeedback,
         ai_score: aiFeedback.score
       });
    }

    // 4. Batch Commit Evaluated Answers
    if (answerInserts.length > 0) {
      await supabase.from('answers').insert(answerInserts);
    }

    // 5. Secure Session Totals explicitly updating My Progress views
    await supabase.from('exam_sessions').update({ total_score: totalScore }).eq('id', session.id);

    return NextResponse.json({ feedbacks: finalFeedbacks, totalScore });

  } catch (err) {
    console.error("Submission DB Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
