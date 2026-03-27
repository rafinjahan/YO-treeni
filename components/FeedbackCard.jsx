import React from "react";

export default function FeedbackCard({ feedback }) {
  if (!feedback) return null;

  return (
    <div className="mt-8 border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-900">Tekoälyn palaute</h3>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm">
          Pisteet: {feedback.score}
        </span>
      </div>
      
      <div className="p-6 space-y-4">
        <p className="text-gray-700">{feedback.summary}</p>

        {feedback.correct?.length > 0 && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2">Onnistumiset:</h4>
            <ul className="list-disc leading-relaxed pl-5 text-green-700 text-sm space-y-1">
              {feedback.correct.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        {feedback.errors?.length > 0 && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <h4 className="font-semibold text-red-800 mb-2">Kehitettävää:</h4>
            <ul className="list-disc leading-relaxed pl-5 text-red-700 text-sm space-y-1">
              {feedback.errors.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        {feedback.hint && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 italic">💡 Vinkki: {feedback.hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
