import Link from "next/link";
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center -mt-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-b from-blue-200 to-transparent opacity-40 blur-[120px] -z-10 rounded-full"></div>
      
      {/* Navigation */}
      <nav className="absolute top-0 w-full pt-8 pb-4 flex justify-between items-center max-w-6xl mx-auto z-50">
        <div className="font-extrabold text-3xl tracking-tighter text-slate-900 drop-shadow-sm">
          YO-Treeni<span className="text-blue-600">.</span>
        </div>
        <div>
          {user ? (
            <Link href="/dashboard" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
              Kojelauta
            </Link>
          ) : (
            <Link href="/login" className="px-6 py-2.5 bg-white text-slate-700 font-semibold rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-sm">
              Kirjaudu sisään
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="text-center z-10 px-4 mt-28">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm tracking-wide shadow-sm">
          Abitreenit uudella tasolla rakenteilla 🚀
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 drop-shadow-sm leading-tight">
          Harjoittele <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            älykkäästi.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          Pitkä matematiikka, lyhyt matematiikka ja fysiikka. Koe tarkka Abitti-ympäristö huipputason tekoälyarvioinnilla täysin integroituna.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href={user ? "/dashboard" : "/login"}
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            Aloita harjoittelu ilmaiseksi
          </Link>
          <a
            href="https://github.com/GoogleCloudPlatform"
            target="_blank" rel="noreferrer"
            className="px-8 py-4 bg-white text-slate-700 border border-slate-200 font-bold rounded-2xl shadow-sm hover:bg-slate-50 transition w-full sm:w-auto"
          >
            Lue lisää
          </a>
        </div>
      </div>
      
      {/* Decorative mockup frame */}
      <div className="mt-20 w-full max-w-4xl h-64 bg-white/40 backdrop-blur-3xl border border-white/80 rounded-t-[2.5rem] shadow-[0_-20px_80px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative border-b-0 flex flex-col items-center">
        <div className="absolute top-5 left-5 flex gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] shadow-sm"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] shadow-sm"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] shadow-sm"></div>
        </div>
        <div className="mt-16 px-12 w-full max-w-2xl opacity-70">
           <div className="h-6 bg-slate-200 rounded-lg w-1/4 mb-4"></div>
           <div className="h-4 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
           <div className="h-4 bg-slate-200 rounded-lg w-5/6 mb-8"></div>
           <div className="h-24 bg-blue-100 rounded-xl w-full border border-blue-200"></div>
        </div>
      </div>
    </div>
  );
}
