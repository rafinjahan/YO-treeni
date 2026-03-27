"use client";

import React, { useState, useEffect } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import FeedbackCard from "@/components/FeedbackCard";
import AbittiEditor from "@/components/AbittiEditor";

export default function PracticePage() {
  const [subject, setSubject] = useState("math_long");
  const [question, setQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  // Securely parses the Digabi object payloads preventing string function crashes
  const getSafeHtml = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (val.answerHtml) return val.answerHtml;
    if (val.html) return val.html;
    if (val.text) return val.text;
    return JSON.stringify(val);
  };


  useEffect(() => {
    fetchQuestion();
  }, [subject]);

  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    setStudentAnswer("");
    
    try {
      const res = await fetch(`/api/questions?subject=${subject}&limit=1`);
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestion(data.questions[Math.floor(Math.random() * data.questions.length)]); // random from pool
      } else {
        setQuestion(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    const rawAnswer = getSafeHtml(studentAnswer);
    if (!rawAnswer || !rawAnswer.trim() || !question) return;
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          studentAnswer: rawAnswer
        })
      });
      const data = await res.json();
      setFeedback(data.feedback);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Harjoittele</h1>
        <select 
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="math_long">Pitkä matematiikka</option>
          <option value="math_short">Lyhyt matematiikka</option>
          <option value="physics">Fysiikka</option>
        </select>
      </div>

      {loading && !question && <p className="text-gray-500">Ladataan tehtävää...</p>}
      
      {!loading && !question && (
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-gray-600">Ei tehtäviä valitussa aineessa.</p>
        </div>
      )}

      {question && (
        <>
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
             <div className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-widest">
               Tehtävä {question.number} ({question.max_points} p)
             </div>
             <div className="text-lg">
               <LatexRenderer text={question.content.text} />
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <h3 className="text-xl font-bold text-gray-800">Vastauksesi</h3>
             {!feedback && !loading ? (
               <AbittiEditor 
                 value={studentAnswer || ""}
                 onChange={(val) => setStudentAnswer(val)}
                 placeholder="Kirjoita vastauksesi (myös kaavat ovat tuettuja)..."
               />
             ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mt-2 prose">
                  {/* Fallback rendering of their rich text string if locked */}
                  <div dangerouslySetInnerHTML={{ __html: getSafeHtml(studentAnswer) }} />
                </div>
             )}
          </div>

          {!feedback ? (
            <button 
              onClick={submitAnswer}
              disabled={loading || getSafeHtml(studentAnswer).trim() === ""}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-md hover:bg-blue-700 transition self-start disabled:opacity-50"
            >
              {loading ? "Tarkistetaan..." : "Tarkista vastaus"}
            </button>
          ) : (
            <div className="flex flex-col gap-6">
              <FeedbackCard feedback={feedback} />
              <button 
                onClick={fetchQuestion}
                className="px-8 py-3 bg-gray-800 text-white font-bold rounded-full shadow-md hover:bg-gray-900 transition self-start"
              >
                Seuraava tehtävä
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
