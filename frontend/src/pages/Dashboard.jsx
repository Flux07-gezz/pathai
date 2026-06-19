import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../utils/storage';
import { useLang } from '../LanguageContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';

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

const recentQuizzes = [
  { subject: 'Math', topic: 'Algebra', score: '85/100', status: 'Strong', date: 'Today, 10:30 AM' },
  { subject: 'Science', topic: 'Physics', score: '60/100', status: 'Weak', date: 'Yesterday, 2:00 PM' },
  { subject: 'Math', topic: 'Probability', score: '45/100', status: 'Weak', date: '2 days ago' },
];

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Quiz', icon: '📝', path: '/quiz' },
  { label: 'Weakness', icon: '📊', path: '/weakness' },
  { label: 'Roadmap', icon: '🤖', path: '/roadmap' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

const subjects = ['Math', 'Science', 'English', 'History'];
const difficulties = ['easy', 'medium', 'hard'];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activePath, setActivePath] = useState('/dashboard');
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const navigate = useNavigate();
  const { t, lang, toggleLang } = useLang();

  useEffect(() => {
    const u = getUser();
    if (!u) navigate('/login');
    else setUser(u);
  }, [navigate]);

  const handleStartQuiz = () => {
    navigate(`/quiz?subject=${selectedSubject}&difficulty=${selectedDifficulty}`);
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
        {/* Logo */}
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

        {/* Nav */}
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

        {/* Bottom promo card */}
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
      <main style={{ marginLeft: 220, flex: 1, padding: '28px 28px 28px 28px', overflowY: 'auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
              Hello, {user?.name} 👋
            </h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>
              {dateStr} — Let's keep learning!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search */}
            <div style={{
              background: '#1e1d3f', border: '1px solid #2d2b5a',
              borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ color: '#8b8ab0', fontSize: 14 }}>🔍</span>
              <input placeholder="Search subjects..." style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 13, width: 160
              }} />
            </div>

            {/* Language toggle */}
            <button onClick={toggleLang} style={{
              background: '#1e1d3f', border: '1px solid #2d2b5a',
              borderRadius: 12, padding: '10px 14px', color: '#a78bfa',
              fontSize: 13, cursor: 'pointer', fontWeight: 600
            }}>
              {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
            </button>

            {/* Notification */}
            <div style={{
              background: '#1e1d3f', border: '1px solid #2d2b5a',
              borderRadius: 12, padding: '10px 14px', cursor: 'pointer'
            }}>
              <span style={{ fontSize: 16 }}>🔔</span>
            </div>

            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── OVERVIEW CARDS ── */}
        <p style={{ color: '#8b8ab0', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Overview</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Quizzes Taken', value: '12', icon: '📝', color: '#ff6b6b', bg: '#ff6b6b22' },
            { label: 'Topics Mastered', value: '8', icon: '✅', color: '#51cf66', bg: '#51cf6622' },
            { label: 'Weak Topics', value: '4', icon: '⚠️', color: '#fcc419', bg: '#fcc41922' },
            { label: 'Day Streak', value: '7', icon: '🔥', color: '#a78bfa', bg: '#a78bfa22' },
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
                <div style={{ height: 3, width: '60%', background: card.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Study Hours Chart */}
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
                { label: 'Quizzes done', value: '6', pct: '79%' },
                { label: 'Topics cleared', value: '3', pct: '100%' },
              ].map((s, i) => (
                <div key={i}>
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

          {/* Performance Chart */}
          <div style={{ background: '#1e1d3f', borderRadius: 16, padding: '20px', border: '1px solid #2d2b5a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>Performance</h3>
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
              <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>+40%</span>
              <span style={{ color: '#8b8ab0', fontSize: 12 }}>improvement compared to last month</span>
            </div>
          </div>
        </div>

        {/* ── START QUIZ + RECENT QUIZZES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>

          {/* Start Quiz Card */}
          <div style={{ background: '#1e1d3f', borderRadius: 16, padding: '20px', border: '1px solid #2d2b5a' }}>
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Start a Quiz</h3>

            <p style={{ color: '#8b8ab0', fontSize: 12, marginBottom: 6 }}>Select Subject</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {subjects.map(s => (
                <button key={s} onClick={() => setSelectedSubject(s)} style={{
                  padding: '10px', borderRadius: 10, border: '1.5px solid',
                  borderColor: selectedSubject === s ? '#6c63ff' : '#2d2b5a',
                  background: selectedSubject === s ? '#6c63ff22' : 'transparent',
                  color: selectedSubject === s ? '#a78bfa' : '#8b8ab0',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}>{s}</button>
              ))}
            </div>

            <p style={{ color: '#8b8ab0', fontSize: 12, marginBottom: 6 }}>Difficulty</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {difficulties.map(d => (
                <button key={d} onClick={() => setSelectedDifficulty(d)} style={{
                  flex: 1, padding: '8px', borderRadius: 10, border: '1.5px solid',
                  borderColor: selectedDifficulty === d ? '#6c63ff' : '#2d2b5a',
                  background: selectedDifficulty === d ? '#6c63ff22' : 'transparent',
                  color: selectedDifficulty === d ? '#a78bfa' : '#8b8ab0',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}>{d}</button>
              ))}
            </div>

            <button onClick={handleStartQuiz} style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
              border: 'none', borderRadius: 12, color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px #6c63ff44'
            }}>
              Start Quiz →
            </button>
          </div>

          {/* Recent Quizzes Table */}
          <div style={{ background: '#1e1d3f', borderRadius: 16, padding: '20px', border: '1px solid #2d2b5a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Quizzes</h3>
              <span onClick={() => navigate('/weakness')} style={{
                color: '#6c63ff', fontSize: 12, cursor: 'pointer', fontWeight: 600
              }}>View all →</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10, padding: '0 4px' }}>
              {['Subject', 'Topic', 'Score', 'Status'].map(h => (
                <span key={h} style={{ color: '#8b8ab0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentQuizzes.map((q, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  background: '#13122e', borderRadius: 12, padding: '14px',
                  alignItems: 'center', border: '1px solid #2d2b5a'
                }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{q.subject}</span>
                  <span style={{ color: '#8b8ab0', fontSize: 12 }}>{q.topic}</span>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{q.score}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                    background: q.status === 'Strong' ? '#51cf6622' : '#ff6b6b22',
                    color: q.status === 'Strong' ? '#51cf66' : '#ff6b6b',
                    display: 'inline-block', width: 'fit-content'
                  }}>{q.status}</span>
                </div>
              ))}
            </div>

            {/* Quick action buttons */}
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