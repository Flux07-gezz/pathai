import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser } from '../utils/storage';
import API from '../utils/api';

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Quiz', icon: '📝', path: '/quiz' },
  { label: 'Weakness', icon: '📊', path: '/weakness' },
  { label: 'Roadmap', icon: '🤖', path: '/roadmap' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

export default function WeaknessReport() {
  const [grouped, setGrouped] = useState({});
  const [totalWeak, setTotalWeak] = useState(0);
  const [strengths, setStrengths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(null);
  const [markingStrength, setMarkingStrength] = useState(null);
  const [activePath] = useState('/weakness');
  const [showStrengths, setShowStrengths] = useState(false);

  const navigate = useNavigate();
  const user = getUser();

  const getToken = () => {
    const raw = localStorage.getItem('token');
    if (!raw) return null;
    return raw.startsWith('"') && raw.endsWith('"') ? JSON.parse(raw) : raw;
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getToken();
      const [weakRes, strengthRes] = await Promise.all([
        API.get(`/weakness/${user.id}`),
        API.get(`/weakness/strengths/${user.id}`)
      ]);
      setGrouped(weakRes.data.grouped || {});
      setTotalWeak(weakRes.data.totalWeak || 0);
      setStrengths(strengthRes.data || []);
    } catch (err) {
      console.error('Failed to fetch weakness data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkStrength = async (topicId, topicName) => {
    setMarkingStrength(topicId);
    try {
      const token = getToken();
      await API.put(`/weakness/mark-strength/${topicId}`, {});
      fetchData();
    } catch (err) {
      console.error('Failed to mark as strength:', err);
    } finally {
      setMarkingStrength(null);
    }
  };

  const handleRetestTopic = async (topicName) => {
    setGeneratingQuiz(topicName);
    try {
      const token = getToken();
      const response = await API.post('/quiz/generate-dynamic', { topic: topicName });
      const questionsData = response?.data?.questions || response?.data;
      if (Array.isArray(questionsData) && questionsData.length > 0) {
        navigate('/quiz', { state: { questions: questionsData, topic: topicName } });
      } else {
        alert('The AI generator did not return questions. Try again.');
      }
    } catch (err) {
      console.error('Failed to generate focus quiz:', err);
      alert('Error contacting the AI engine.');
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const getScoreColor = (score) => {
    if (score < 30) return '#ff6b6b';
    if (score < 50) return '#fcc419';
    return '#a78bfa';
  };

  const subjectColors = {
    Math: '#6c63ff',
    Science: '#51cf66',
    English: '#fcc419',
    History: '#ff6b6b',
    General: '#a78bfa'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, background: '#13122e', display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ padding: '0 24px 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>P</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>PathAI</span>
          <span style={{ fontSize: 9, background: '#6c63ff33', color: '#a78bfa', padding: '2px 6px', borderRadius: 20, fontWeight: 600 }}>Beta</span>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const active = activePath === item.path;
            return (
              <div key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 24px', cursor: 'pointer', margin: '2px 12px', borderRadius: 12, transition: 'all 0.2s', background: active ? 'linear-gradient(135deg, #6c63ff, #8b5cf6)' : 'transparent', color: active ? '#fff' : '#8b8ab0', fontWeight: active ? 600 : 400, fontSize: 14 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </nav>
        <div style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg, #6c63ff22, #a78bfa22)', border: '1px solid #6c63ff44', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
          <p style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>Samsung Solve</p>
          <p style={{ color: '#8b8ab0', fontSize: 11, margin: '0 0 10px' }}>for Tomorrow 2026</p>
          <div style={{ background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>Our Project</div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>Weakness Report 📊</h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>Topics where you scored below 50% — work on these to unlock new ones</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Weak topic counter */}
            <div style={{ background: totalWeak >= 10 ? '#ff6b6b22' : '#6c63ff22', border: `1px solid ${totalWeak >= 10 ? '#ff6b6b44' : '#6c63ff44'}`, borderRadius: 12, padding: '8px 16px', color: totalWeak >= 10 ? '#ff6b6b' : '#a78bfa', fontSize: 13, fontWeight: 700 }}>
              {totalWeak}/10 weak topics
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* 10 topic limit warning */}
        {totalWeak >= 10 && (
          <div style={{ background: '#ff6b6b11', border: '1px solid #ff6b6b33', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <p style={{ color: '#ff6b6b', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Weak topic limit reached!</p>
              <p style={{ color: '#8b8ab0', fontSize: 13, margin: 0 }}>You have 10 weak topics. No new weak topics will be tracked until you improve existing ones above 70% or mark them as strengths. Don't just find problems — fix them! 💪</p>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: '#8b8ab0', fontSize: 14 }}>Analyzing your performance...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <div style={{ background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 20, padding: '48px 24px', textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>No Weak Topics!</h3>
            <p style={{ color: '#8b8ab0', fontSize: 14, margin: '0 0 24px' }}>Great work! Take a quiz to track your performance.</p>
            <button onClick={() => navigate('/quiz')} style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Take a Quiz
            </button>
          </div>
        ) : (
          <div>
            {/* Grouped by subject */}
            {Object.entries(grouped).map(([subject, topics]) => (
              <div key={subject} style={{ marginBottom: 28 }}>

                {/* Subject header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 4, background: subjectColors[subject] || '#6c63ff' }} />
                  <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>{subject}</p>
                  <span style={{ background: '#2d2b5a', color: '#8b8ab0', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                    {topics.length} weak {topics.length === 1 ? 'topic' : 'topics'}
                  </span>
                </div>

                {/* Topic cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  {topics.map((topic) => (
                    <div key={topic._id} style={{ background: '#1e1d3f', borderRadius: 16, padding: 20, border: '1px solid #2d2b5a', borderLeft: `4px solid ${getScoreColor(topic.score)}` }}>

                      {/* Topic name + score */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>{topic.topic}</h3>
                        <span style={{ background: `${getScoreColor(topic.score)}22`, color: getScoreColor(topic.score), padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {topic.score}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: 4, background: '#2d2b5a', borderRadius: 4, marginBottom: 16 }}>
                        <div style={{ height: 4, width: `${topic.score}%`, background: getScoreColor(topic.score), borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>

                      <p style={{ color: '#8b8ab0', fontSize: 12, margin: '0 0 14px', lineHeight: 1.5 }}>
                        {topic.score < 30
                          ? 'Critical — needs immediate attention!'
                          : topic.score < 50
                          ? 'Below passing — needs practice'
                          : 'Getting there — keep going!'}
                      </p>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleRetestTopic(topic.topic)}
                          disabled={generatingQuiz !== null}
                          style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg, #6c63ff22, #a78bfa22)', border: '1px solid #6c63ff44', borderRadius: 10, color: '#a78bfa', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          {generatingQuiz === topic.topic ? 'Loading...' : '⚡ Practice'}
                        </button>
                        <button
                          onClick={() => handleMarkStrength(topic._id, topic.topic)}
                          disabled={markingStrength === topic._id}
                          style={{ flex: 1, padding: '9px', background: '#51cf6611', border: '1px solid #51cf6633', borderRadius: 10, color: '#51cf66', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          {markingStrength === topic._id ? '...' : '✅ I mastered this'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Generate Roadmap CTA */}
            <div style={{ background: 'linear-gradient(135deg, #6c63ff11, #8b5cf611)', border: '1px dashed #6c63ff66', borderRadius: 20, padding: '32px', textAlign: 'center', marginTop: 8 }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Ready to fix these weak spots?</h3>
              <p style={{ color: '#8b8ab0', fontSize: 14, marginBottom: 20 }}>Let Gemini AI build a personalized day-by-day study plan targeting your exact weak topics.</p>
              <button onClick={() => navigate('/roadmap')} style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(108, 99, 255, 0.4)' }}>
                🤖 Generate AI Study Roadmap →
              </button>
            </div>

            {/* Strengths section */}
            {strengths.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <button onClick={() => setShowStrengths(!showStrengths)} style={{ background: 'transparent', border: 'none', color: '#51cf66', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {showStrengths ? '▲' : '▼'} 💪 Strengths Achieved ({strengths.length})
                </button>
                {showStrengths && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {strengths.map(s => (
                      <div key={s._id} style={{ background: '#51cf6611', border: '1px solid #51cf6633', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#51cf66', fontSize: 13, fontWeight: 700 }}>✅ {s.topic}</span>
                        <span style={{ color: '#8b8ab0', fontSize: 11 }}>{s.subject} · {s.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}