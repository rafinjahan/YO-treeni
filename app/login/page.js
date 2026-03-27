"use client";
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-10 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/80 relative overflow-hidden group">
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mix-blend-multiply opacity-30 animate-blob filter blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-gradient-to-tr from-purple-300 to-pink-300 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-2000 filter blur-3xl transition-transform duration-700 group-hover:scale-110"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 mb-8 transform -rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Tervetuloa takaisin</h1>
          <p className="text-slate-500 text-center mb-10 font-medium leading-relaxed">
            Kirjaudu sisään jatkaaksesi harjoittelua ja seurataksesi menestystäsi.
          </p>

          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full relative flex items-center justify-center gap-4 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl transition-all duration-300 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="tracking-tight text-lg">Kirjaudu Googlella</span>
              </>
            )}
          </button>
          
          <p className="text-xs text-slate-400 mt-8 text-center px-6">
            Jatkamalla hyväksyt YO-Treenin vakiintuneet käyttöehdot.
          </p>
        </div>
      </div>
    </div>
  );
}
