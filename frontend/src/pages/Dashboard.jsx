import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/storage';
import { useLang } from '../LanguageContext';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import {API} from '../utils/api';

const studyData = [
  { day: 'S', hours: 1 },
  { day: 'M', hours: 2.5 },
  { day: 'T', hours: 1.5 },
  { day: 'W', hours: 3 },
  { day: 'T', hours: 2 },
  { day: 'F', hours: 3.5 },
  { day: 'S', hours: 4 },
];

const performanceData = [
  { month: 'Jan', score: 55 },
  { month: 'Feb', score: 62 },
  { month: 'Mar', score: 58 },
  { month: 'Apr', score: 70 },
  { month: 'May', score: 75 },
  { month: 'Jun', score: 80 },
];

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Quiz', icon: '📝', path: '/quiz' },
  { label: 'Weakness', icon: '📊', path: '/weakness' },
  { label: 'Roadmap', icon: '🤖', path: '/roadmap' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activePath, setActivePath] = useState('/dashboard');
  const [topicInput, setTopicInput] = useState('');
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Real stats data frame hook state
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    roadmapCompletionPercent: 0,
    weakTopicsCount: 0,
    recentActivity: []
  });

  const navigate = useNavigate();
  const { lang, toggleLang } = useLang();

  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate('/login');
      return;
    } 
    
    if (!u.studentClass) {
      navigate('/onboarding');
      return;
    } 
    
    setUser(u);
    
    // Fetch aggregated data straight from MongoDB connection route
    const fetchDashboardStats = async () => {
      try {
        const rawToken = localStorage.getItem('token');
        if (!rawToken) return;

        // Clean extra literal JSON quotes if present
        const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
          ? JSON.parse(rawToken)
          : rawToken;

        const response = await API.get('/dashboard/stats');

        setStats(response.data);
      } catch (err) {
        console.error("Failed to recover live database indicators:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  const handleStartDynamicQuiz = async () => {
    if (!topicInput.trim() || loadingQuiz) return;

    setLoadingQuiz(true);
    try {
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
        ? JSON.parse(rawToken)
        : rawToken;

      const response = await API.post('/quiz/generate-dynamic', { topic: topicInput });

      // Check both possible data key paths safely (.questions or direct array)
      const questionsData = response?.data?.questions || response?.data;

      // Validate that questions data is actually a non-empty array before shifting pages
      if (Array.isArray(questionsData) && questionsData.length > 0) {
        console.log("Successfully generated dynamic questions array:", questionsData);
        navigate('/quiz', { state: { questions: questionsData, topic: topicInput } });
      } else {
        alert("The AI service responded successfully but returned zero questions. Your AI model key might be hitting a token usage limit.");
      }

    } catch (error) {
      console.error("Full Quiz Generation Error Log:", error);
      
      // Check if the backend responded with a 429 Rate Limit status code
      if (error.response && error.response.status === 429) {
        alert(error.response.data.message); 
      } else {
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        alert(
          backendMessage 
            ? `AI Generation Failed: ${backendMessage}` 
            : "Could not reach the AI generation service. Check your backend terminal log to see if your API Key is expired, invalid, or rate-limited."
        );
      }
    } finally {
      setLoadingQuiz(false);
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

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
                onClick={() => { setActivePath(item.path); navigate(item.path); }}
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

      {/* ── MAIN CONTENT ── */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
              Hello, {user?.name || 'Anshu'} 👋 <span style={{ fontSize: 14, color: '#a78bfa', background: '#6c63ff22', padding: '4px 10px', borderRadius: 20, marginLeft: 8 }}>{user?.studentClass}</span>
            </h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>
              {dateStr} — Let's keep learning!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={toggleLang} style={{
              background: '#1e1d3f', border: '1px solid #2d2b5a',
              borderRadius: 12, padding: '10px 14px', color: '#a78bfa',
              fontSize: 13, cursor: 'pointer', fontWeight: 600
            }}>
              {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
            </button>

            <div style={{
              background: '#1e1d3f', border: '1px solid #2d2b5a',
              borderRadius: 12, padding: '10px 14px', cursor: 'pointer'
            }}>
              <span style={{ fontSize: 16 }}>🔔</span>
            </div>

            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* ── OVERVIEW CARDS ── */}
        <p style={{ color: '#8b8ab0', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Overview</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Quizzes Taken', value: loadingStats ? '...' : stats.totalQuizzes, icon: '📝', color: '#ff6b6b', bg: '#ff6b6b22', progress: `${Math.min(stats.totalQuizzes * 10, 100)}%` },
            { label: 'Average Score', value: loadingStats ? '...' : `${stats.averageScore}%`, icon: '✅', color: '#51cf66', bg: '#51cf6622', progress: `${stats.averageScore}%` },
            { label: 'Weak Topics', value: loadingStats ? '...' : stats.weakTopicsCount, icon: '⚠️', color: '#fcc419', bg: '#fcc41922', progress: `${Math.min(stats.weakTopicsCount * 20, 100)}%` },
            { label: 'Roadmap Goals', value: loadingStats ? '...' : `${stats.roadmapCompletionPercent}%`, icon: '🔥', color: '#a78bfa', bg: '#a78bfa22', progress: `${stats.roadmapCompletionPercent}%` },
          ].map((card, i) => (
            <div key={i} style={{
              background: '#1e1d3f', borderRadius: 16, padding: '20px',
              border: '1px solid #2d2b5a'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: card.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>{card.icon}</div>
                <span style={{ color: '#8b8ab0', fontSize: 12 }}>{card.label}</span>
              </div>
              <p style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>{card.value}</p>
              <div style={{ height: 3, background: '#2d2b5a', borderRadius: 4 }}>
                <div style={{ height: 3, width: card.progress, background: card.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#1e1d3f', borderRadius: 16, padding: '20px', border: '1px solid #2d2b5a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>Study Hours</h3>
              <span style={{
                background: '#2d2b5a', color: '#a78bfa', fontSize: 11,
                padding: '4px 10px', borderRadius: 8, fontWeight: 600
              }}>This Week</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Time spent', value: '14h', pct: '85%' },
                { label: 'Quizzes done', value: stats.totalQuizzes, pct: '100%' },
                { label: 'Topics tracked', value: stats.weakTopicsCount, pct: '--' },
              ].map((s, i) => (
                <div key={i} style={{ minWidth: '90px' }}>
                  <p style={{ color: '#8b8ab0', fontSize: 10, margin: '0 0 2px' }}>{s.label}</p>
                  <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {s.value} <span style={{ fontSize: 10, color: '#51cf66' }}>{s.pct}</span>
                  </p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={studyData} barSize={14}>
                <XAxis dataKey="day" tick={{ fill: '#8b8ab0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#2d2b5a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  cursor={{ fill: '#ffffff10' }}
                />
                <Bar dataKey="hours" fill="#6c63ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#1e1d3f', borderRadius: 16, padding: '20px', border: '1px solid #2d2b5a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>Performance Tracker</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2b5a" />
                <XAxis dataKey="month" tick={{ fill: '#8b8ab0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#2d2b5a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2.5}
                  dot={{ fill: '#a78bfa', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{stats.averageScore > 0 ? `Avg: ${stats.averageScore}%` : '0%'}</span>
              <span style={{ color: '#8b8ab0', fontSize: 12 }}>live overall aggregate score from history profiles</span>
            </div>
          </div>
        </div>

        {/* ── NCERT UNIVERSAL SEARCH CONTAINER (Form detached to avoid loop conditions) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr', gap: 16 }}>

          <div style={{ background: '#1e1d3f', borderRadius: 16, padding: '20px', border: '1px solid #2d2b5a', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>NCERT Curriculum Practice</h3>
            <p style={{ color: '#8b8ab0', fontSize: 13, marginBottom: 18, lineHeight: '1.4' }}>
              Type in any specific NCERT textbook subject, sub-chapter, or target topic to start practicing and analyze weak areas.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: '#13122e', border: '1.5px solid #2d2b5a', borderRadius: 12,
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span style={{ fontSize: 16 }}>📖</span>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., Photosynthesis, Real Numbers, Force Laws..."
                  disabled={loadingQuiz}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontSize: 14, flex: 1
                  }}
                  required
                />
              </div>

              <button 
                onClick={handleStartDynamicQuiz}
                disabled={loadingQuiz || !topicInput.trim()} 
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
                  border: 'none', borderRadius: 12, color: '#fff',
                  fontSize: 14, fontWeight: 700, 
                  cursor: (loadingQuiz || !topicInput.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (loadingQuiz || !topicInput.trim()) ? 0.6 : 1,
                  boxShadow: '0 4px 20px #6c63ff44', transition: 'all 0.2s'
                }}
              >
                {loadingQuiz ? 'Analyzing & Generating Quiz... ⏳' : 'Generate AI Quiz →'}
              </button>
            </div>
          </div>

          {/* Recent Quizzes Table */}
          <div style={{ background: '#1e1d3f', borderRadius: 16, padding: '20px', border: '1px solid #2d2b5a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Activity Log</h3>
              <span onClick={() => navigate('/weakness')} style={{
                color: '#6c63ff', fontSize: 12, cursor: 'pointer', fontWeight: 600
              }}>View all →</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 8, marginBottom: 10, padding: '0 4px' }}>
              {['Topic/Module', 'Score Metric', 'Status Tracker'].map(h => (
                <span key={h} style={{ color: '#8b8ab0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentActivity.length === 0 ? (
                <div style={{ color: '#8b8ab0', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  No session logs found. Complete a customized NCERT quiz to populate this live grid block!
                </div>
              ) : (
                stats.recentActivity.map((q, i) => {
                  const percent = Math.round((q.score / q.totalQuestions) * 100);
                  const isStrong = percent >= 70;
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr',
                      background: '#13122e', borderRadius: 12, padding: '14px',
                      alignItems: 'center', border: '1px solid #2d2b5a'
                    }}>
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.topicName}</span>
                      <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>{q.score} / {q.totalQuestions} ({percent}%)</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                        background: isStrong ? '#51cf6622' : '#ff6b6b22',
                        color: isStrong ? '#51cf66' : '#ff6b6b',
                        display: 'inline-block', width: 'fit-content'
                      }}>{isStrong ? 'Strong Match' : 'Weak Area'}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => navigate('/weakness')} style={{
                flex: 1, padding: '11px', background: '#2d2b5a', border: 'none',
                borderRadius: 10, color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>📊 Weakness Report</button>
              <button onClick={() => navigate('/roadmap')} style={{
                flex: 1, padding: '11px',
                background: 'linear-gradient(135deg, #6c63ff22, #a78bfa22)',
                border: '1px solid #6c63ff44',
                borderRadius: 10, color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>🤖 AI Roadmap</button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}