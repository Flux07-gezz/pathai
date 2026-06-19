// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Navbar from '../components/Navbar';
// import { getQuestions, submitQuiz } from '../utils/api';
// import { getUser } from '../utils/storage';

// function QuizPage() {
//   const [questions, setQuestions] = useState([]);
//   const [current, setCurrent] = useState(0);
//   const [selected, setSelected] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [score, setScore] = useState(0);
//   const [finished, setFinished] = useState(false);
  
//   const navigate = useNavigate();
//   const location = useLocation();
//   const user = getUser();

//   const searchParams = new URLSearchParams(location.search);
//   const subject = searchParams.get('subject') || 'Math';
//   const topic = searchParams.get('topic') || 'General';

//   useEffect(() => {
//     const fetchQuizData = async () => {
//       try {
//         setLoading(true);
//         const res = await getQuestions(user?.id || user?._id, subject, topic);
//         if (res && res.data && Array.isArray(res.data)) {
//           setQuestions(res.data);
//         }
//       } catch (err) {
//         console.error("Error pulling quiz details:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (user?.id || user?._id) fetchQuizData();
//   }, [subject, topic]);

//   const handleNext = async () => {
//     const q = questions[current];
//     const isCorrect = selected === q?.correctAnswer;
//     let newScore = score;

//     if (isCorrect) {
//       newScore = score + 1;
//       setScore(prev => prev + 1);
//     }

//     if (current + 1 < questions.length) {
//       setCurrent(prev => prev + 1);
//       setSelected(null);
//     } else {
//       setLoading(true);
//       try {
//         await submitQuiz({
//           userId: user?.id || user?._id,
//           subject,
//           totalScore: Math.round((newScore / questions.length) * 100),
//           questionsData: questions
//         });
//       } catch (err) {
//         console.error("Submission failed:", err);
//       }
//       setLoading(false);
//       setFinished(true);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0f0c1b] text-gray-100">
//         <Navbar />
//         <div className="flex flex-col items-center justify-center h-96">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
//           <div className="text-purple-400 text-lg font-medium">Compiling specialized AI questions...</div>
//         </div>
//       </div>
//     );
//   }

//   if (questions.length === 0) {
//     return (
//       <div className="min-h-screen bg-[#0f0c1b] text-gray-100">
//         <Navbar />
//         <div className="max-w-2xl mx-auto px-6 py-20 text-center">
//           <div className="bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-8 backdrop-blur-md">
//             <h2 className="text-xl font-bold text-gray-100">No questions found</h2>
//             <p className="text-gray-400 mt-2 mb-6">Could not connect to the dynamic AI evaluation engine.</p>
//             <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium">
//               Return to Dashboard
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (finished) {
//     return (
//       <div className="min-h-screen bg-[#0f0c1b] text-gray-100">
//         <Navbar />
//         <div className="max-w-2xl mx-auto px-6 py-20">
//           <div className="bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-8 backdrop-blur-md text-center">
//             <div className="text-5xl mb-4">🎉</div>
//             <h2 className="text-2xl font-bold text-gray-100 mb-2">Quiz Completed!</h2>
//             <p className="text-gray-400 mb-6">You scored {score} out of {questions.length}</p>
//             <div className="bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-[#2e2a56] text-white rounded-xl p-6 mb-6">
//               <p className="text-4xl font-bold text-purple-300">{Math.round((score / questions.length) * 100)}%</p>
//               <p className="text-gray-400 text-sm mt-1">Syllabus Master Rating</p>
//             </div>
//             <div className="flex gap-4">
//               <button onClick={() => navigate('/weakness')} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium">
//                 See Weakness Report
//               </button>
//               <button onClick={() => navigate('/dashboard')} className="flex-1 bg-[#2e2a56]/40 border border-[#443e7a] text-gray-300 py-3 rounded-xl font-medium hover:bg-[#2e2a56]/70">
//                 Back to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const q = questions[current] || { questionText: '', options: [], topic: '' };

//   return (
//     <div className="min-h-screen bg-[#0f0c1b] text-gray-100">
//       <Navbar />
//       <div className="max-w-3xl mx-auto px-6 py-10">

//         {/* Progress Metrics Bar */}
//         <div className="mb-8">
//           <div className="flex justify-between text-sm text-gray-400 mb-3">
//             <span>Question <strong className="text-purple-400">{current + 1}</strong> of {questions.length}</span>
//             <span className="text-xs font-semibold bg-[#2e2a56]/50 border border-[#443e7a] px-3 py-1 rounded-full text-purple-300 uppercase tracking-wider">
//               {user?.educationBoard || 'NCERT'} • {user?.studentLevel || 'Class 7'}
//             </span>
//           </div>
//           <div className="bg-[#1d1b36] rounded-full h-2 border border-[#2e2a56]">
//             <div
//               className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300 m-[1px]"
//               style={{ width: `${((current + 1) / questions.length) * 100}%` }}
//             />
//           </div>
//         </div>

//         {/* Question Panel Container */}
//         <div className="bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-8 backdrop-blur-md shadow-xl">
//           <div className="bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4 tracking-wide uppercase">
//             {q.topic || topic}
//           </div>
//           <h2 className="text-xl font-bold text-gray-100 mb-8 leading-relaxed">{q.questionText}</h2>

//           {/* Multiple Choice Selection Blocks */}
//           <div className="space-y-4">
//             {q.options && q.options.map((option, index) => (
//               <button
//                 key={index}
//                 type="button"
//                 onClick={() => setSelected(option)}
//                 className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
//                   selected === option
//                     ? 'border-purple-500 bg-purple-600/20 text-purple-200'
//                     : 'border-[#2e2a56] bg-[#131126]/40 hover:border-purple-500/40 text-gray-300 hover:text-gray-100'
//                 }`}
//               >
//                 {option}
//               </button>
//             ))}
//           </div>

//           {/* Footer Navigation Trigger */}
//           <button
//             type="button"
//             onClick={handleNext}
//             disabled={!selected}
//             className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-purple-900/20"
//           >
//             {current + 1 === questions.length ? 'Finish Quiz Assessment' : 'Next Question'}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default QuizPage;
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getQuestions, submitQuiz } from '../utils/api';
import { getUser } from '../utils/storage';

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const searchParams = new URLSearchParams(location.search);
  const subject = searchParams.get('subject') || 'Math';
  const topic = searchParams.get('topic') || 'General';

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const res = await getQuestions(user?.id || user?._id, subject, topic);
        if (res && res.data && Array.isArray(res.data)) {
          setQuestions(res.data);
        }
      } catch (err) {
        console.error("Error pulling quiz details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id || user?._id) fetchQuizData();
  }, [subject, topic]);

  const handleNext = async () => {
    const q = questions[current];
    const isCorrect = selected === q?.correctAnswer;
    let newScore = score;

    if (isCorrect) {
      newScore = score + 1;
      setScore(prev => prev + 1);
    }

    if (current + 1 < questions.length) {
      setCurrent(prev => prev + 1);
      setSelected(null);
    } else {
      setLoading(true);
      try {
        await submitQuiz({
          userId: user?.id || user?._id,
          subject,
          totalScore: Math.round((newScore / questions.length) * 100),
          questionsData: questions
        });
      } catch (err) {
        console.error("Submission failed:", err);
      }
      setLoading(false);
      setFinished(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0c1b] text-gray-100 font-sans antialiased">
      
      {/* LEFT SIDEBAR NAVIGATION PANELS (Matches dashboard style perfectly) */}
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
            <button onClick={() => navigate('/quiz')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/20 transition-all">
              <span>📝</span> Quiz
            </button>
            <button onClick={() => navigate('/weakness')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-[#1d1b36]/40 hover:text-gray-200 transition-all">
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

      {/* MAIN CONTENT AREA GRID FRAME */}
      <main className="flex-1 min-w-0 flex flex-col">
        
        {/* TOP PROFILE HEADER BLOCK */}
        <header className="h-20 border-b border-[#2e2a56] px-8 flex items-center justify-between bg-[#0f0c1b]/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              Live Quiz Assessment
              <span className="text-xs font-normal bg-[#2e2a56] px-2.5 py-1 rounded-full text-purple-300 uppercase tracking-wider">
                {user?.studentLevel || 'Class 7'}
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-[#1d1b36] border border-[#2e2a56] rounded-xl px-3 py-1.5 text-xs text-purple-300 font-medium">
              🇮🇳 EN / हिंदी
            </div>
            <div className="h-9 w-9 rounded-xl bg-[#1d1b36] border border-[#2e2a56] flex items-center justify-center cursor-pointer text-sm">🔔</div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold shadow-sm shadow-purple-900/30 text-sm">T</div>
          </div>
        </header>

        {/* CONTAINER VIEWPORTS */}
        <div className="flex-1 p-8 max-w-4xl w-full mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
              <div className="text-purple-400 text-sm font-medium tracking-wide">Compiling specialized AI questions...</div>
            </div>
          ) : finished ? (
            <div className="bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-8 backdrop-blur-md text-center max-w-2xl mx-auto shadow-xl">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Quiz Completed!</h2>
              <p className="text-gray-400 text-sm mb-6">You scored {score} out of {questions.length}</p>
              
              <div className="bg-[#131126]/60 border border-[#2e2a56] text-white rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                <p className="text-4xl font-bold text-indigo-400">{Math.round((score / questions.length) * 100)}%</p>
                <p className="text-gray-400 text-xs mt-1 uppercase tracking-wider font-semibold">Syllabus Master Rating</p>
              </div>
              
              <div className="flex gap-3 max-w-md mx-auto">
                <button onClick={() => navigate('/weakness')} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-950/50">
                  See Weakness Report
                </button>
                <button onClick={() => navigate('/dashboard')} className="flex-1 bg-[#2e2a56]/40 border border-[#443e7a] text-gray-300 py-3 rounded-xl font-medium text-sm hover:bg-[#2e2a56]/70 transition-all">
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-8 backdrop-blur-md text-center max-w-xl mx-auto">
              <h2 className="text-lg font-bold text-gray-100">No questions found</h2>
              <p className="text-gray-400 text-sm mt-1 mb-6">Could not connect to the dynamic AI engine.</p>
              <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm">
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* TIMELINE PROGRESS HOVER */}
              <div className="mb-6 flex items-center justify-between text-xs text-gray-400">
                <span>Question <strong className="text-indigo-400 text-sm font-bold">{current + 1}</strong> of {questions.length}</span>
                <span className="bg-[#2e2a56]/40 px-2.5 py-1 rounded-md text-purple-300 font-semibold tracking-wider uppercase border border-[#443e7a]/40">
                  {subject} ➔ {topic}
                </span>
              </div>
              
              {/* QUESTION CARD */}
              <div className="bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-8 backdrop-blur-md shadow-xl">
                <h3 className="text-lg font-medium text-gray-100 leading-relaxed mb-8">
                  {questions[current]?.questionText}
                </h3>
                
                {/* BUTTONS STYLED EXACTLY LIKE THE DASHBOARD ENTRIES */}
                <div className="space-y-3">
                  {questions[current]?.options?.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelected(option)}
                      className={`w-full text-left px-5 py-4 rounded-xl border font-medium text-sm transition-all duration-150 ${
                        selected === option
                          ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-inner'
                          : 'border-[#2e2a56] bg-[#131126]/40 hover:border-[#443e7a] text-gray-300 hover:bg-[#1d1b36]/30'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* SUBMIT BUTTON WITH SLICK GRADIENT ACTION METRICS */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selected}
                  className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-indigo-950/40"
                >
                  {current + 1 === questions.length ? 'Finish Quiz Assessment →' : 'Next Question →'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default QuizPage;