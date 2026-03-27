"use client";

import React, { useState } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import FeedbackCard from "@/components/FeedbackCard";
import ExamTimer from "@/components/ExamTimer";
import AbittiEditor from "@/components/AbittiEditor";

// Phase 1: Setup, Phase 2: Active, Phase 3: Results
export default function ExamPage() {
  const [phase, setPhase] = useState(1);
  const [subject, setSubject] = useState("math_long");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(false);

  // Securely resolves Abitti editor object payloads avoiding trimming crashes
  const getSafeHtml = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (val.answerHtml) return val.answerHtml;
    if (val.html) return val.html;
    if (val.text) return val.text;
    return JSON.stringify(val);
  };
  
  const startExam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions?subject=${subject}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions.sort((a,b) => a.number - b.number));
        setPhase(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async () => {
    setLoading(true);
    
    // Batch responses securing valid state parameters from Digabi payloads
    const formattedAnswers = questions.map(q => ({
       questionId: q.id,
       content: getSafeHtml(answers[q.id])
    })).filter(ans => ans.content.trim() !== "");

    if (formattedAnswers.length === 0) {
      setPhase(3);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/submissions", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            userId: "d14f9d0c-e2f7-41a4-b0fe-7eb0dbd4c4f0",
            subject,
            mode: "mock",
            answers: formattedAnswers
         })
      });
      
      const data = await res.json();
      if (data.feedbacks) {
         setFeedbacks(data.feedbacks);
      }
    } catch (err) {
      console.error(err);
    }

    setPhase(3);
    setLoading(false);
  };

  const handleTimeExpiration = () => {
    submitExam();
  };

  const totalScore = Object.values(feedbacks).reduce((sum, f) => sum + (f?.score || 0), 0);
  const maxPossible = questions.reduce((sum, q) => sum + q.max_points, 0);

  if (phase === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Aloita Harjoituskoe</h1>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full flex flex-col gap-6">
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Valitse aine</span>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="math_long">Pitkä matematiikka</option>
              <option value="math_short">Lyhyt matematiikka</option>
              <option value="physics">Fysiikka</option>
            </select>
          </label>
          <button 
            onClick={startExam}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Ladataan..." : "Aloita Koe (6 tuntia)"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 2) {
    return (
      <div className="flex flex-col gap-8 pb-32">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md py-4 border-b border-gray-200 flex justify-between items-center px-4 -mx-4">
          <h2 className="text-xl font-bold flex items-center gap-4">
            Harjoituskoe
          </h2>
          <div className="flex items-center gap-4">
            <ExamTimer durationMinutes={360} onExpire={handleTimeExpiration} />
            <button 
              onClick={submitExam}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition text-sm disabled:opacity-50"
            >
              {loading ? "Palautetaan..." : "Palauta koe"}
            </button>
          </div>
        </div>

        {questions.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              Tehtävä {q.number} ({q.max_points} p)
            </div>
            <div className="text-lg mb-4">
              <LatexRenderer text={q.content.text} />
            </div>
            
            <AbittiEditor 
              value={answers[q.id] || ""}
              onChange={(val) => setAnswers({ ...answers, [q.id]: val })}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center bg-blue-50 p-10 rounded-3xl border border-blue-100">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Koetulokset</h1>
        <p className="text-2xl text-blue-800 font-medium">
          Yhteispisteet: {totalScore} / {maxPossible}
        </p>
      </div>

      {questions.map((q) => (
        <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Tehtävä {q.number}
            </div>
            <LatexRenderer text={q.content.text} />
          </div>
          
           <div className="bg-gray-50 p-6 flex flex-col gap-4">
            <h4 className="font-bold text-gray-700">Sinun vastauksesi:</h4>
            <div className="font-mono text-sm break-words bg-white p-4 rounded-lg border border-gray-200">
              {getSafeHtml(answers[q.id]).trim().length > 0 ? (
                 <div dangerouslySetInnerHTML={{ __html: getSafeHtml(answers[q.id]) }} />
              ) : (
                <span className="text-gray-400 italic">Ei vastausta</span>
              )}
            </div>
          </div>

          <div className="px-6 pb-6">
            <FeedbackCard feedback={feedbacks[q.id]} />
          </div>
        </div>
      ))}
      
      <div className="flex justify-center mt-8">
        <button 
          onClick={() => setPhase(1)}
          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition"
        >
          Palaa etusivulle
        </button>
      </div>
    </div>
  );
}
