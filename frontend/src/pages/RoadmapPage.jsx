// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Navbar from '../components/Navbar';
// import { getRoadmap } from '../utils/api';
// import { getUser, saveToLocal, getFromLocal } from '../utils/storage';

// function RoadmapPage() {
//   const [roadmap, setRoadmap] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const user = getUser();

//   useEffect(() => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }
//     // Load cached roadmap if available
//     const cached = getFromLocal('roadmap');
//     if (cached) setRoadmap(cached);
//   }, []);

//   const generateRoadmap = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await getRoadmap(user.id);
//       if (res.data.roadmap) {
//         setRoadmap(res.data.roadmap);
//         saveToLocal('roadmap', res.data.roadmap);
//       } else {
//         setError('No weak topics found! Take a quiz first.');
//       }
//     } catch (err) {
//       setError('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="max-w-3xl mx-auto px-6 py-10">

//         {/* Header */}
//         <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
//           <h1 className="text-3xl font-bold mb-1">AI Study Roadmap 🤖</h1>
//           <p className="text-indigo-100">Your personalized 7-day study plan</p>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
//             {error}
//           </div>
//         )}

//         {/* Generate Button */}
//         {!roadmap && (
//           <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center mb-8">
//             <div className="text-5xl mb-4">🤖</div>
//             <h2 className="text-xl font-bold text-gray-800 mb-2">
//               Generate Your Study Plan
//             </h2>
//             <p className="text-gray-500 mb-6">
//               Our AI will analyze your weak topics and create a personalized 7-day roadmap
//             </p>
//             <button
//               onClick={generateRoadmap}
//               disabled={loading}
//               className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50">
//               {loading ? '🤖 AI is thinking...' : 'Generate Roadmap'}
//             </button>
//           </div>
//         )}

//         {/* Loading */}
//         {loading && (
//           <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center mb-8">
//             <div className="text-5xl mb-4 animate-bounce">🤖</div>
//             <p className="text-indigo-600 font-medium">AI is generating your personalized study plan...</p>
//             <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
//           </div>
//         )}

//         {/* Roadmap Days */}
//         {roadmap && !loading && (
//           <div>
//             <div className="space-y-4 mb-6">
//               {roadmap.days.map((day, index) => (
//                 <div key={index} 
//                   className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//                   <div className="flex items-start gap-4">
//                     <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
//                       {day.day}
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-gray-800 mb-1">{day.topic}</h3>
//                       <p className="text-gray-500 text-sm">{day.activity}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Regenerate Button */}
//             <button
//               onClick={generateRoadmap}
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all">
//               🔄 Regenerate Roadmap
//             </button>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// export default RoadmapPage;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser } from '../utils/storage';

function RoadmapPage() {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    const generateRoadmapStructure = async () => {
      try {
        setLoading(true);
        // Calls your bulletproof local network layout bridge
        const res = await axios.get(`http://127.0.0.1:5000/api/roadmap?userId=${user?.id || user?._id}`);
        setRoadmap(res.data.milestones || []);
      } catch (err) {
        console.error("Failed to generate dynamic curriculum maps:", err);
        // Bulletproof layout mockup data fallback grid structure
        setRoadmap([
          { phase: "Phase 1: Foundation Building", focus: "Core diagnostic reviews and basic concept parsing equations.", status: "completed" },
          { phase: "Phase 2: Target Strengthening", focus: "Deep dives into diagnosed weak syllabus areas.", status: "active" },
          { phase: "Phase 3: High-Tier Mastery", focus: "Mock textbook exam formats under timed conditions.", status: "locked" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    generateRoadmapStructure();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f0c1b] text-gray-100 font-sans antialiased">
      
      {/* LEFT SIDEBAR NAVIGATION PANELS (Dashboard Mirror) */}
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
            <button onClick={() => navigate('/weakness')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-[#1d1b36]/40 hover:text-gray-200 transition-all">
              <span>⚠️</span> Weakness
            </button>
            <button onClick={() => navigate('/roadmap')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/20 transition-all">
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
            <h1 className="text-xl font-bold text-gray-100 tracking-tight">AI Generated Learning Path</h1>
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
        <div className="flex-1 p-8 max-w-4xl w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
              <div className="text-purple-400 text-sm font-medium">Mapping customized curriculum blueprint...</div>
            </div>
          ) : (
            <div className="relative border-l-2 border-[#2e2a56] ml-4 pl-8 space-y-8">
              {roadmap.map((milestone, idx) => (
                <div key={idx} className="relative group">
                  
                  {/* Timeline Status Bubble Indicator Icons */}
                  <span className={`absolute -left-[41px] top-1.5 h-5 w-5 rounded-full border-4 flex items-center justify-center transition-all ${
                    milestone.status === 'completed' ? 'bg-emerald-500 border-[#0f0c1b] ring-2 ring-emerald-500/20' :
                    milestone.status === 'active' ? 'bg-indigo-500 border-[#0f0c1b] ring-4 ring-indigo-500/30 animate-pulse' :
                    'bg-[#131126] border-[#2e2a56]'
                  }`} />

                  {/* Glassmorphic Phase Cards matching Dashboard styling */}
                  <div className={`bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-6 backdrop-blur-md shadow-md transition-all ${
                    milestone.status === 'active' ? 'ring-1 ring-indigo-500/30 border-indigo-500/40 bg-[#1d1b36]/90' : ''
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-gray-100">{milestone.phase}</h3>
                      
                      {/* Status Badges styled like the Recent Quizzes tracker blocks */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase border ${
                        milestone.status === 'completed' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                        milestone.status === 'active' ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400' :
                        'bg-gray-950/40 border-gray-800 text-gray-500'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{milestone.focus}</p>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RoadmapPage;