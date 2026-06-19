import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import axiosInstance from 'axios'; // or use your standard axios import directly
import { getUser } from '../utils/storage';

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Quiz', icon: '📝', path: '/quiz' },
  { label: 'Weakness', icon: '📊', path: '/weakness' },
  { label: 'Roadmap', icon: '🤖', path: '/roadmap' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

export default function WeaknessReport() {
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(null);
  const [activePath, setActivePath] = useState('/weakness');
  
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWeaknessData = async () => {
      try {
        const rawToken = localStorage.getItem('token');
        if (!rawToken) return;

        const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
          ? JSON.parse(rawToken)
          : rawToken;

        const response = await axiosInstance.get('http://localhost:5000/api/auth/stats', {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });

        setWeakTopics(response.data.weakTopicsList || []);
      } catch (err) {
        console.error("Failed to fetch weakness analytics profile metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeaknessData();
  }, [navigate]);

  const handleRetestTopic = async (topicName) => {
    setGeneratingQuiz(topicName);
    try {
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
        ? JSON.parse(rawToken)
        : rawToken;

      const response = await axiosInstance.post(
        'http://localhost:5000/api/quiz/generate-dynamic',
        { topic: topicName },
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );

      const questionsData = response?.data?.questions || response?.data;

      if (Array.isArray(questionsData) && questionsData.length > 0) {
        navigate('/quiz', { state: { questions: questionsData, topic: topicName } });
      } else {
        alert("The AI generator did not return active modules. Try again.");
      }
    } catch (err) {
      console.error("Failed to build focus quiz module:", err);
      alert("Error contacting the AI compiler engine.");
    } finally {
      setGeneratingQuiz(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>

      {/* ── SIDEBAR (Identical to Dashboard) ── */}
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

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px', overflowY: 'auto' }}>
        
        {/* Top Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
              Weakness Analysis Report 📊
            </h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>
              Review syllabus metrics compiled from quiz accuracy rates below 70%.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#a78bfa', background: '#6c63ff22', padding: '6px 14px', borderRadius: 20, fontWeight: 600 }}>
              {user?.studentClass || 'Class 8'}
            </span>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16
            }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* Dynamic Display State Panels */}
        {loading ? (
          <p style={{ color: '#8b8ab0', fontSize: 14 }}>Analyzing backend tracking metrics...</p>
        ) : weakTopics.length === 0 ? (
          <div style={{ background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: '20px', padding: '48px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>No Weakness Zones Detected!</h3>
            <p style={{ color: '#8b8ab0', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}>
              Awesome work! All of your logged quiz records meet or exceed our target parameters.
            </p>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px #6c63ff44' }}>
              Take a Custom Quiz Module
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#8b8ab0', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Target Remediation Blocks</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
              {weakTopics.map((topic, idx) => (
                <div key={idx} style={{ background: '#1e1d3f', borderRadius: 16, padding: '24px', border: '1px solid #2d2b5a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, background: '#ff6b6b22', color: '#ff6b6b', padding: '4px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' }}>Attention Needed</span>
                      <span style={{ color: '#8b8ab0', fontSize: 12, fontWeight: 500 }}>Syllabus Target</span>
                    </div>
                    <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{topic}</h3>
                    <p style={{ color: '#8b8ab0', fontSize: 13, margin: 0, lineHeight: '1.5' }}>
                      Performance statistics denote structural gaps in foundational knowledge. We recommend launching an optimized AI review.
                    </p>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: 4, background: '#2d2b5a', borderRadius: 4, marginBottom: 16 }}>
                      <div style={{ height: 4, width: '55%', background: '#ff6b6b', borderRadius: 4 }} />
                    </div>
                    
                    <button
                      onClick={() => handleRetestTopic(topic)}
                      disabled={generatingQuiz !== null}
                      style={{
                        width: '100%', padding: '12px',
                        background: 'linear-gradient(135deg, #6c63ff22, #a78bfa22)',
                        border: '1px solid #6c63ff44', borderRadius: 12, color: '#a78bfa',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {generatingQuiz === topic ? 'Assembling Focus Quiz...' : 'Launch Targeted Review Quiz ⚡'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Giant Roadmap Generation Card directly mimicking search box style */}
            <div style={{ background: 'linear-gradient(135deg, #6c63ff11, #8b5cf611)', border: '1px dashed #6c63ff66', borderRadius: 20, padding: '32px', textAlign: 'center', marginTop: '32px' }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Ready to optimize your schedule?</h3>
              <p style={{ color: '#8b8ab0', fontSize: 14, marginBottom: 20 }}>Let Gemini look at these specific weakness indicators and construct an immediate day-by-day roadmap plan.</p>
              <button 
                onClick={() => navigate('/roadmap')}
                style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(108, 99, 255, 0.4)' }}
              >
                🤖 Generate AI Study Roadmap →
              </button>
            </div>

          </div>
        )}
      </main>

    </div>
  );
}