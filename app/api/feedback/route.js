import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateFeedback } from '@/lib/ai';

export async function POST(request) {
  try {
    const { questionId, sessionId, studentAnswer } = await request.json();

    if (!questionId || !studentAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the question to get the model_answer and max_points
    const { data: questionData, error: qError } = await supabase
      .from('questions')
      .select(`
        content,
        max_points,
        model_answer,
        exams (
          subject
        )
      `)
      .eq('id', questionId)
      .single();

    if (qError || !questionData) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Call AI stub
    const aiFeedback = await generateFeedback({
      question: questionData.content.text,
      studentAnswer,
      modelAnswer: questionData.model_answer || "",
      maxPoints: questionData.max_points,
      subject: questionData.exams?.subject || "general"
    });

    // Save logic
    // We mock session if not provided, for practice sessions we might create a dummy session or assume sessionId is valid.
    let targetSessionId = sessionId;

    if (!targetSessionId) {
      // Mock user and session logic since we don't have full auth wired
      // In reality we get user from context
      const { data: session } = await supabase
        .from('exam_sessions')
        .insert({ mode: 'practice' }) // assumes trigger or defaults handle user/session creation safely if mock
        .select('id')
        .single();
        
      targetSessionId = session?.id || "d14f9d0c-e2f7-41a4-b0fe-7eb0dbd4c4f0"; // dummy fallback
    }

    // Save the answer
    if (targetSessionId !== "d14f9d0c-e2f7-41a4-b0fe-7eb0dbd4c4f0") {
      await supabase.from('answers').insert({
        session_id: targetSessionId,
        question_id: questionId,
        content: studentAnswer,
        ai_feedback: aiFeedback,
        ai_score: aiFeedback.score
      });
    }

    return NextResponse.json({ feedback: aiFeedback });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
