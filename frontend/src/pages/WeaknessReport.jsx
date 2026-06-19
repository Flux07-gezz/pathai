import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeakTopics } from '../utils/api';
import { getUser } from '../utils/storage';

function WeaknessReport() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    const fetchWeaknessMetrics = async () => {
      try {
        setLoading(true);
        const res = await getWeakTopics(user?.id || user?._id);
        if (res && res.data) setReports(res.data);
      } catch (err) {
        console.error("Failed to parse historical metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id || user?._id) fetchWeaknessMetrics();
  }, []);

  const subjects = Object.keys(reports || {});

  return (
    <div className="flex min-h-screen bg-[#0f0c1b] text-gray-100 font-sans antialiased">
      
      {/* LEFT SIDEBAR NAVIGATION PANELS */}
      <aside className="w-64 border-r border-[#2e2a56] bg-[#0f0c1b] p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="font-bold text-lg tracking-tight text-white">PathAI <span className="text-[10px] bg-indigo-600/30 text-indigo-300 px-1.5 py-0.5 rounded ml-1 font-normal uppercase">Beta</span></span>
          </div>
          
          <nav className="space-y-1.5">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-[#1d1b36]/40 hover:text-gray-200 transition-all">
              <span>📊</span> Dashboard
            </button>
            <button onClick={() => navigate('/quiz')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-[#1d1b36]/40 hover:text-gray-200 transition-all">
              <span>📝</span> Quiz
            </button>
            <button onClick={() => navigate('/weakness')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/20 transition-all">
              <span>⚠️</span> Weakness
            </button>
            <button onClick={() => navigate('/roadmap')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-[#1d1b36]/40 hover:text-gray-200 transition-all">
              <span>🗺️</span> Roadmap
            </button>
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-[#1d1b36]/40 hover:text-gray-200 transition-all">
              <span>⚙️</span> Settings
            </button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col">
        
        {/* TOP PROFILE HEADER BLOCK */}
        <header className="h-20 border-b border-[#2e2a56] px-8 flex items-center justify-between bg-[#0f0c1b]/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-100 tracking-tight">Weakness Performance Report</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-[#1d1b36] border border-[#2e2a56] rounded-xl px-3 py-1.5 text-xs text-purple-300 font-medium">
              🇮🇳 EN / हिंदी
            </div>
            <div className="h-9 w-9 rounded-xl bg-[#1d1b36] border border-[#2e2a56] flex items-center justify-center text-sm">🔔</div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">T</div>
          </div>
        </header>

        {/* DETAILS WRAPPER CONTAINER */}
        <div className="flex-1 p-8 max-w-5xl w-full mx-auto space-y-6">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
              <div className="text-purple-400 text-sm font-medium">Analyzing diagnostic data frameworks...</div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-16 text-center backdrop-blur-md max-w-2xl mx-auto shadow-xl">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-lg font-bold text-gray-100">Your profile tracking metrics are clean!</h2>
              <p className="text-gray-400 text-sm mt-2 mb-6">Complete more adaptive board assessments to extract focal points here.</p>
              <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md">
                Start Practice Quiz Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {subjects.map((subjectName) => {
                const topicList = reports[subjectName] || [];
                if (topicList.length === 0) return null;

                return (
                  /* CONTAINER WITH SAME SHARP GLASS EFFECT AS RECENT QUIZZES GRID */
                  <div key={subjectName} className="bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-6 backdrop-blur-md shadow-lg">
                    <h2 className="text-sm font-semibold tracking-wider text-purple-300 uppercase mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      {subjectName} Chapters Needing Focus
                    </h2>
                    
                    {/* BUTTON LIST GRID PATTERNS WITH EMBEDDED DYNAMIC RE-ROUTE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {topicList.map((topicItem, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => navigate(`/quiz?subject=${subjectName}&topic=${topicItem}`)}
                          className="flex items-center justify-between px-5 py-4 rounded-xl border border-[#2e2a56] bg-[#131126]/60 hover:bg-[#1d1b36]/40 hover:border-indigo-500/50 cursor-pointer transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-amber-500 text-sm">⚠️</span>
                            <span className="text-sm font-medium text-gray-200 group-hover:text-white">{topicItem}</span>
                          </div>
                          
                          {/* STATUS BADGES LINKED TO CORRECTION FILTERS */}
                          <span className="text-[10px] bg-red-950/50 border border-red-900/60 text-red-400 font-semibold px-2.5 py-1 rounded-md tracking-wider uppercase group-hover:bg-red-900/30 transition-all">
                            Review Concept →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default WeaknessReport;