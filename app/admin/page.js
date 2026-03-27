"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * A protected client-side route providing easy graphical injection of past Exams
 * such as YLE Abitreenit archives directly into the Supabase database.
 */
export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [number, setNumber] = useState("");
  const [content, setContent] = useState("");
  const [maxPoints, setMaxPoints] = useState(6);
  const [modelAnswer, setModelAnswer] = useState("");
  const [status, setStatus] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "yotreeni2026") {
      setAuthenticated(true);
      fetchExams();
    } else {
      setStatus("Väärä salasana.");
    }
  };

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*').order('year', { ascending: false });
    if (data) {
      setExams(data);
      if (data.length > 0) setSelectedExam(data[0].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Tallennetaan tietokantaan...");
    
    // Ingests the Question Content formatting correctly to match DB constraints
    const { error } = await supabase.from('questions').insert({
      exam_id: selectedExam,
      number: parseInt(number),
      content: { text: content },
      max_points: parseInt(maxPoints),
      model_answer: modelAnswer
    });

    if (error) {
       setStatus(`Virhe tallennuksessa: ${error.message} (Tarkista ettet luo duplikaattia samalla numerolla!)`);
    } else {
       setStatus(`✅ Tehtävä ${number} tallennettu tietokantaan onnistuneesti!`);
       setNumber("");
       setContent("");
       setModelAnswer("");
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Opettajan Ylläpitopaneeli</h1>
        <p className="text-gray-500 text-center max-w-sm mb-4">Kirjaudu sisään lisätäksesi vanhoja kokeita ja tehtäviä Yo-Treenin valikoimaan.</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm">
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Salasana koekäyttöön..." 
            className="border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            autoFocus 
          />
          <button type="submit" className="bg-gray-900 text-white font-bold p-4 rounded-xl hover:bg-gray-800 transition">
            Kirjaudu sisään
          </button>
          {status && <p className="text-red-500 text-sm font-semibold text-center mt-2">{status}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-40">
      <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">Tehtävien Syöttötyökalu</h1>
        <p className="text-blue-800 font-medium">Liitä vanhojen ylioppilaskokeiden PDF-tekstejä ja LaTeX-kaavoja suoraan harjoitusalustalle.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
        
        <label className="flex flex-col gap-3">
          <span className="font-bold text-gray-800">Valitse Koe (Subject / Year / Season)</span>
          <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="border border-gray-300 p-4 rounded-xl bg-gray-50 focus:bg-white" required>
             {exams.map(e => (
                <option key={e.id} value={e.id}>{e.subject.toUpperCase()} - {e.season} {e.year}</option>
             ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-6">
          <label className="flex flex-col gap-3">
            <span className="font-bold text-gray-800">Tehtävän Numero</span>
            <input type="number" min="1" value={number} onChange={e => setNumber(e.target.value)} required className="border border-gray-300 p-4 rounded-xl bg-gray-50 focus:bg-white" placeholder="esim. 1" />
          </label>

          <label className="flex flex-col gap-3">
            <span className="font-bold text-gray-800">Maksimipisteet</span>
            <input type="number" min="1" max="120" value={maxPoints} onChange={e => setMaxPoints(e.target.value)} required className="border border-gray-300 p-4 rounded-xl bg-gray-50 focus:bg-white" />
          </label>
        </div>

        <label className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">Tehtävänanto</span>
            <span className="text-sm text-gray-500">Käytä normaalia tekstiä ja LaTeX-kaavoja $$ tai $ ympäröitynä.</span>
          </div>
          <textarea rows={6} value={content} onChange={e => setContent(e.target.value)} className="border border-gray-300 p-4 rounded-xl bg-gray-50 focus:bg-white font-mono text-sm leading-relaxed" placeholder="Esim. Ratkaise epäyhtälö $$x^2 - 4 > 0$$..." required />
        </label>

        <label className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">Virallinen Mallivastaus / Arvosteluperusteet</span>
            <span className="text-sm text-gray-500">Tekoäly (OpenAI) lukee tämän kentän antaakseen tarkan arvosanan (esim. nimeä keskeiset vaiheet joista saa pisteitä).</span>
          </div>
          <textarea rows={6} value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} className="border border-gray-300 p-4 rounded-xl bg-gray-50 focus:bg-white text-sm" placeholder="YTL:n viralliset hyvän vastauksen piirteet..." required />
        </label>

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-5 rounded-full transition shadow-md mt-4 text-lg">
          Luo Tehtävä
        </button>

        {status && <div className={`p-5 font-semibold rounded-2xl text-center border ${status.includes("✅") ? "bg-green-50 text-green-900 border-green-200" : "bg-red-50 text-red-900 border-red-200"}`}>{status}</div>}
      </form>
    </div>
  );
}
