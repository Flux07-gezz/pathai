import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser } from '../utils/storage';

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Quiz', icon: '📝', path: '/quiz' },
  { label: 'Weakness', icon: '📊', path: '/weakness' },
  { label: 'Roadmap', icon: '🤖', path: '/roadmap' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  
  // ── STATE VARIABLES ──
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [topicName, setTopicName] = useState(location.state?.topic || '');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [activePath] = useState('/quiz');

  // Search & Loading States
  const [topicInput, setTopicInput] = useState('');
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [savingScore, setSavingScore] = useState(false);
  
  // Quiz History States
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // ── FETCH RECENTLY SOLVED HISTORY ──
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (questions.length === 0) {
      const fetchHistory = async () => {
        try {
          const rawToken = localStorage.getItem('token');
          const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
            ? JSON.parse(rawToken)
            : rawToken;

          const res = await axios.get('http://localhost:5000/api/quiz/history', {
            headers: { Authorization: `Bearer ${cleanToken}` }
          });
          setHistory(res.data.quizzesTaken || []);
        } catch (err) {
          console.error("Failed to load quiz history profiles:", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [questions, navigate, user]);

  // ── GENERATE AI QUIZ DIRECTLY FROM THIS PAGE ──
  const handleStartQuizDirectly = async (e) => {
    e.preventDefault();
    if (!topicInput.trim() || loadingQuiz) return;

    setLoadingQuiz(true);
    try {
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
        ? JSON.parse(rawToken)
        : rawToken;

      const response = await axios.post(
        'http://localhost:5000/api/quiz/generate-dynamic',
        { topic: topicInput },
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );

      const questionsData = response?.data?.questions || response?.data;

      if (Array.isArray(questionsData) && questionsData.length > 0) {
        setQuestions(questionsData);
        setTopicName(topicInput);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScore(0);
      } else {
        alert("The AI service returned zero questions. Try another topic.");
      }
    } catch (error) {
      console.error("Quiz Page generation catch block caught:", error);
      
      // Check if the backend responded with a 429 Rate Limit status code
      if (error.response && error.response.status === 429) {
        alert(error.response.data.message); 
      } 
      else if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } 
      else {
        alert("AI Generation Failed. Please ensure your backend is up and running.");
      }
    } finally {
      setLoadingQuiz(false);
    }
  };

  // ── ASSIGN ANSWERS ──
  const handleSelectOption = (optionIndex) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optionIndex });
  };

  // ── SUBMIT QUIZ & LOG TO MONGODB ──
  const handleSubmitQuiz = async () => {
    let calculatedScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctOptionIndex) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);
    setSavingScore(true);

    try {
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
        ? JSON.parse(rawToken)
        : rawToken;

      await axios.post('http://localhost:5000/api/quiz/save-score', {
        topicName: topicName,
        score: calculatedScore,
        totalQuestions: questions.length
      }, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
    } catch (err) {
      console.error("Score saved locally, failed to update backend cluster metrics:", err);
    } finally {
      setSavingScore(false);
    }
  };

  // ── BACK TO SEARCH WORKSPACE DASHBOARD CLEAR ──
  const handleResetWorkspace = () => {
    setQuestions([]);
    setTopicName('');
    setIsSubmitted(false);
    setTopicInput('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, background: '#13122e', display: 'flex', flexDirection: 'column',
        padding: '28px 0', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10
      }}>
        <div style={{ padding: '0 24px 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff'
          }}>P</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>PathAI</span>
          <span style={{
            fontSize: 9, background: '#6c63ff33', color: '#a78bfa',
            padding: '2px 6px', borderRadius: 20, fontWeight: 600
          }}>Beta</span>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const active = activePath === item.path;
            return (
              <div key={item.path}
                onClick={() => { navigate(item.path); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 24px', cursor: 'pointer', margin: '2px 12px',
                  borderRadius: 12, transition: 'all 0.2s',
                  background: active ? 'linear-gradient(135deg, #6c63ff, #8b5cf6)' : 'transparent',
                  color: active ? '#fff' : '#8b8ab0',
                  fontWeight: active ? 600 : 400, fontSize: 14,
                }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </nav>

        <div style={{
          margin: '0 16px 16px', background: 'linear-gradient(135deg, #6c63ff22, #a78bfa22)',
          border: '1px solid #6c63ff44', borderRadius: 16, padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
          <p style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>Samsung Solve</p>
          <p style={{ color: '#8b8ab0', fontSize: 11, margin: '0 0 10px' }}>for Tomorrow 2026</p>
          <div style={{
            background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
            color: '#fff', fontSize: 11, fontWeight: 600,
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer'
          }}>Our Project</div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, width: '100%' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>AI Quiz Workspace 📝</h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>
              {topicName ? `Active Practice Module: ${topicName}` : 'Formulate dynamic textbook curriculum assessments.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#a78bfa', background: '#6c63ff22', padding: '6px 14px', borderRadius: 20, fontWeight: 600 }}>
              {user?.studentClass || 'Class 7'}
            </span>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16
            }}>
              {user?.name?.[0]?.toUpperCase() || 'T'}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
          
          {questions.length === 0 ? (
            /* CASE 1: EMPTY WORKSPACE */
            <div style={{ maxWidth: '680px', width: '100%' }}>
              <div style={{ background: '#1e1d3f', borderRadius: '16px', padding: '24px', border: '1px solid #2d2b5a', marginBottom: '32px' }}>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '0 0 14px' }}>Launch a New Practice Quiz</h3>
                <form onSubmit={handleStartQuizDirectly} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#13122e', border: '1.5px solid #2d2b5a', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>📖</span>
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="Enter any NCERT topic (e.g., Photosynthesis, Trigonometry)..."
                      disabled={loadingQuiz}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', flex: 1 }}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loadingQuiz || !topicInput.trim()} 
                    style={{ 
                      width: '100%', padding: '14px', 
                      background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', 
                      border: 'none', borderRadius: '12px', color: '#fff', 
                      fontSize: '14px', fontWeight: 700, 
                      cursor: (loadingQuiz || !topicInput.trim()) ? 'not-allowed' : 'pointer',
                      opacity: (loadingQuiz || !topicInput.trim()) ? 0.6 : 1,
                      boxShadow: '0 4px 20px #6c63ff44' 
                    }}
                  >
                    {loadingQuiz ? 'Generating AI Exam... ⏳' : 'Generate AI Quiz →'}
                  </button>
                </form>
              </div>

              {/* Recently Solved History Logs */}
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recently Solved Logs</h3>
              {loadingHistory ? (
                <p style={{ color: '#8b8ab0', fontSize: '13px' }}>Loading historical metrics...</p>
              ) : history.length === 0 ? (
                <div style={{ background: '#13122e', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid #2d2b5a', color: '#8b8ab0', fontSize: '13px' }}>
                  No questions solved yet. Start your first dynamic exam above!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {history.map((item, idx) => {
                    const pct = Math.round((item.score / item.totalQuestions) * 100);
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e1d3f', padding: '16px 20px', borderRadius: '14px', border: '1px solid #2d2b5a' }}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>{item.topicName}</h4>
                          <span style={{ color: '#8b8ab0', fontSize: '11px' }}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{item.score}/{item.totalQuestions}</span>
                          <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px', color: pct >= 70 ? '#51cf66' : '#ff6b6b' }}>
                            {pct}% Accurate
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !isSubmitted ? (
            /* CASE 2: ACTIVE EXAM ENGINE */
            <div style={{ maxWidth: '680px', width: '100%', background: '#1e1d3f', borderRadius: '20px', padding: '32px', border: '1px solid #2d2b5a', alignSelf: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '16px' }}>
                <span>Active Core Question</span>
                <span>{currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              
              <p style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 600, margin: '0 0 24px', color: '#fff' }}>{questions[currentQuestionIndex].questionText}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {questions[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                  return (
                    <div key={idx} onClick={() => handleSelectOption(idx)} style={{ padding: '16px', background: isSelected ? '#6c63ff22' : '#13122e', border: isSelected ? '1.5px solid #6c63ff' : '1.5px solid #2d2b5a', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: isSelected ? '6px solid #6c63ff' : '2px solid #2d2b5a', background: isSelected ? '#fff' : 'transparent', boxSizing: 'border-box' }} />
                      <span style={{ fontSize: '15px', color: isSelected ? '#fff' : '#8b8ab0', fontWeight: isSelected ? 600 : 400 }}>{option}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))} disabled={currentQuestionIndex === 0} style={{ padding: '12px 24px', background: '#2d2b5a', border: 'none', borderRadius: '12px', color: '#a78bfa', cursor: 'pointer', opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}>← Previous</button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <button onClick={handleSubmitQuiz} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #51cf66, #37b24d)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit Assessment</button>
                ) : (
                  <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} style={{ padding: '12px 24px', background: '#6c63ff', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>Next Question →</button>
                )}
              </div>
            </div>
          ) : (
            /* CASE 3: FINAL ASSESSMENT SUMMARY */
            <div style={{ maxWidth: '680px', width: '100%', background: '#1e1d3f', borderRadius: '20px', padding: '40px', border: '1px solid #2d2b5a', textAlign: 'center', alignSelf: 'flex-start' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>{(score / questions.length) * 100 >= 70 ? '🎉' : '📚'}</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Assessment Finalized!</h3>
              
              <div style={{ display: 'inline-flex', flexDirection: 'column', background: '#13122e', padding: '24px 48px', borderRadius: '16px', border: '1px solid #2d2b5a', marginBottom: '32px', marginTop: '16px' }}>
                <span style={{ fontSize: '12px', color: '#8b8ab0', textTransform: 'uppercase', fontWeight: 600 }}>Recorded Accuracy</span>
                <span style={{ fontSize: '48px', color: (score / questions.length) * 100 >= 70 ? '#51cf66' : '#ff6b6b', fontWeight: 800, marginTop: 4 }}>{score} / {questions.length}</span>
                <span style={{ fontSize: '14px', color: '#a78bfa', fontWeight: 600, marginTop: '4px' }}>{Math.round((score / questions.length) * 100)}% Performance</span>
              </div>
              
              <div>
                <button onClick={handleResetWorkspace} disabled={savingScore} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}>
                  {savingScore ? 'Saving results...' : 'Complete & Exit Workspace'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}