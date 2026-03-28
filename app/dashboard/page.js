import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: progress, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching progress:", error);
  }

  const subjects = [
    { id: 'math_long', name: 'Pitkä matematiikka', icon: '📐', color: 'from-blue-500 to-indigo-600' },
    { id: 'math_short', name: 'Lyhyt matematiikka', icon: '📏', color: 'from-emerald-500 to-teal-600' },
    { id: 'physics', name: 'Fysiikka', icon: '⚛️', color: 'from-purple-500 to-pink-600' }
  ];

  return (
    <div className="flex flex-col gap-10 min-h-screen py-10 relative">
      <div className="z-10 flex justify-between items-end">
        <div>
           <h1 className="text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">Oma Edistyminen</h1>
           <p className="text-lg text-slate-600">Tervetuloa takaisin, <span className="font-semibold text-slate-800">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>. Seuraa kehitystäsi eri osa-alueilla.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 z-10 w-full">
        {subjects.map((subj) => {
          const stats = progress?.find(p => p.subject === subj.id) || { sessions_count: 0, avg_score_percentage: 0 };
          
          return (
            <div key={subj.id} className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subj.color} flex items-center justify-center text-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {subj.icon}
              </div>
              
              <h3 className="font-bold text-slate-800 text-2xl mb-4">{subj.name}</h3>
              
              <div className="flex justify-between items-center text-sm text-slate-500 font-semibold mb-3">
                <span>Istuntoja: {stats.sessions_count}</span>
                <span>{stats.avg_score_percentage}% Oikein</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-8 shadow-inner">
                <div 
                  className={`h-4 rounded-full bg-gradient-to-r ${subj.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${stats.avg_score_percentage}%` }}
                />
              </div>

              <Link 
                href={`/practice?subject=${subj.id}`}
                className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-slate-50 hover:bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group-hover:text-blue-600"
              >
                Siirry harjoittelemaan
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          );
        })}
      </div>
      
      {/* Quick Actions overlay */}
      <div className="mt-6 p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden z-10">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
         <div className="relative z-10 mb-6 md:mb-0">
           <h2 className="text-3xl font-bold mb-2">Tee simuloitu ylioppilaskoe</h2>
           <p className="text-blue-100 font-medium">Koe aito Abitti-koeympäristö ajanotolla.</p>
         </div>
         <Link href="/exam" className="relative z-10 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 hover:scale-105 transition-all">
           Aloita Koe
         </Link>
      </div>

    </div>
  );
}
