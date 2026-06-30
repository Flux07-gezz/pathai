import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/storage';
import { getRoadmaps, generateRoadmap, completeRoadmap } from '../utils/api';

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Quiz', icon: '📝', path: '/quiz' },
  { label: 'Weakness', icon: '📊', path: '/weakness' },
  { label: 'Roadmap', icon: '🤖', path: '/roadmap' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

const subjects = ['Math', 'Science', 'English', 'History'];

export default function RoadmapPage() {
  const [activeRoadmaps, setActiveRoadmaps] = useState([]);
  const [archivedRoadmaps, setArchivedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subject, setSubject] = useState('Math');
  const [expandedRoadmap, setExpandedRoadmap] = useState(null);
  const [completedDays, setCompletedDays] = useState({});
  const [activePath] = useState('/roadmap');
  const [showArchive, setShowArchive] = useState(false);

  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  const fetchRoadmaps = useCallback( async () => {
    try {
      const res = await getRoadmaps(user.id);
      setActiveRoadmaps(res.data.activeRoadmaps);
      setArchivedRoadmaps(res.data.archivedRoadmaps);
      setLoading(false);
    } catch (err) {
      setError('Failed to load roadmaps');
      setLoading(false);
    }
  });

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      await generateRoadmap({ userId: user.id, subject });
      setSuccess(`Roadmap for ${subject} generated successfully!`);
      fetchRoadmaps();
    } catch (err) {
      const msg = err.response?.data?.message;
      const info = err.response?.data?.info;
      if (msg === 'limit_reached') {
        setError('You have 5 active roadmaps! Complete at least one before generating a new one.');
      } else if (msg === 'already_exists' || msg === 'related_subject') {
        setError(info);
      } else if (msg === 'no_weak_topics') {
        setError('No weak topics found! Take a quiz first.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = async (roadmapId) => {
    if (!window.confirm('Mark this roadmap as completed? It will be moved to your archive.')) return;
    try {
      await completeRoadmap(roadmapId);
      setSuccess('Roadmap completed and archived! You can now generate a new one.');
      setExpandedRoadmap(null);
      fetchRoadmaps();
    } catch (err) {
      setError('Failed to complete roadmap.');
    }
  };

  const toggleDayComplete = (roadmapId, dayNum) => {
    setCompletedDays(prev => {
      const key = `${roadmapId}-${dayNum}`;
      const updated = { ...prev };
      updated[key] = !updated[key];
      return updated;
    });
  };

  const isDayDone = (roadmapId, dayNum) => !!completedDays[`${roadmapId}-${dayNum}`];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarLogo}>
            <div style={styles.logoIcon}>P</div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>PathAI</span>
          </div>
        </aside>
        <div style={styles.centerWorkspace}>
          <div style={styles.loadingSpinner}></div>
          <p style={{ color: '#8b8ab0', marginTop: 16, fontSize: 14 }}>Loading your roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIcon}>P</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>PathAI</span>
          <span style={styles.betaBadge}>Beta</span>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const active = activePath === item.path;
            return (
              <div key={item.path} onClick={() => navigate(item.path)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 24px',
                cursor: 'pointer', margin: '2px 12px', borderRadius: 12, transition: 'all 0.2s',
                background: active ? 'linear-gradient(135deg, #6c63ff, #8b5cf6)' : 'transparent',
                color: active ? '#fff' : '#8b8ab0', fontWeight: active ? 600 : 400, fontSize: 14
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </nav>
        <div style={styles.sidebarFooterCard}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
          <p style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>Samsung Solve</p>
          <p style={{ color: '#8b8ab0', fontSize: 11, margin: '0 0 10px' }}>for Tomorrow 2026</p>
          <div style={styles.footerCardBtn}>Our Project</div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px', overflowY: 'auto' }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>AI Learning Roadmap 🤖</h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>
              Personalized 7-day study plans based on your weak topics
            </p>
          </div>
          <div style={{
            background: '#1e1d3f', border: '1px solid #2d2b5a',
            borderRadius: 12, padding: '8px 16px',
            color: activeRoadmaps.length >= 5 ? '#ff6b6b' : '#a78bfa',
            fontSize: 13, fontWeight: 600
          }}>
            {activeRoadmaps.length}/5 active
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ background: '#ff6b6b11', border: '1px solid #ff6b6b33', color: '#ff6b6b', padding: '14px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#51cf6611', border: '1px solid #51cf6633', color: '#51cf66', padding: '14px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13 }}>
            ✅ {success}
          </div>
        )}

        {/* Generate New Roadmap */}
        <div style={{ background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 20, padding: 24, marginBottom: 28 }}>
          <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Generate New Roadmap</h2>

          {activeRoadmaps.length >= 5 ? (
            <div style={{ background: '#fcc41911', border: '1px solid #fcc41933', color: '#fcc419', padding: '14px 16px', borderRadius: 12, fontSize: 13 }}>
              ⚠️ You have 5 active roadmaps. Complete at least one to generate a new one!
            </div>
          ) : (
            <>
              <p style={{ color: '#8b8ab0', fontSize: 12, marginBottom: 10 }}>Select Subject</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {subjects.map(s => (
                  <button key={s} onClick={() => setSubject(s)} style={{
                    padding: '10px', borderRadius: 10,
                    border: `1.5px solid ${subject === s ? '#6c63ff' : '#2d2b5a'}`,
                    background: subject === s ? '#6c63ff22' : 'transparent',
                    color: subject === s ? '#a78bfa' : '#8b8ab0',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}>{s}</button>
                ))}
              </div>
              <button onClick={handleGenerate} disabled={generating} style={{
                width: '100%', padding: '13px',
                background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
                border: 'none', borderRadius: 12, color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                opacity: generating ? 0.6 : 1, boxShadow: '0 4px 20px #6c63ff44'
              }}>
                {generating ? '🤖 AI is generating your roadmap...' : '🤖 Generate Roadmap'}
              </button>
            </>
          )}
        </div>

        {/* Active Roadmaps */}
        {activeRoadmaps.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ color: '#8b8ab0', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              Active Roadmaps ({activeRoadmaps.length}/5)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeRoadmaps.map(roadmap => (
                <div key={roadmap._id} style={{ background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 20, overflow: 'hidden' }}>

                  {/* Header */}
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ background: '#6c63ff22', color: '#a78bfa', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {roadmap.subject}
                        </span>
                        <span style={{ background: '#51cf6622', color: '#51cf66', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                          Active
                        </span>
                      </div>
                      <span style={{ color: '#5d5c7f', fontSize: 11 }}>
                        {new Date(roadmap.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <p style={{ color: '#8b8ab0', fontSize: 12, marginBottom: 14 }}>
                      Weak topics: {roadmap.weakTopics.map(t => t.topic).join(', ')}
                    </p>

                    <button
                      onClick={() => setExpandedRoadmap(expandedRoadmap === roadmap._id ? null : roadmap._id)}
                      style={{ background: 'transparent', border: 'none', color: '#6c63ff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {expandedRoadmap === roadmap._id ? '▲ Hide 7-day plan' : '▼ View 7-day plan'}
                    </button>
                  </div>

                  {/* 7 Day Plan */}
                  {expandedRoadmap === roadmap._id && (
                    <div style={{ borderTop: '1px solid #2d2b5a', padding: 24 }}>
                      <p style={{ color: '#8b8ab0', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                        Study Milestones
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                        {roadmap.days.map(dayPlan => {
                          const isDone = isDayDone(roadmap._id, dayPlan.day);
                          return (
                            <div key={dayPlan.day} style={{
                              background: '#13122e', border: '1px solid #2d2b5a',
                              borderLeft: `4px solid ${isDone ? '#51cf66' : '#6c63ff'}`,
                              borderRadius: 14, padding: 20, opacity: isDone ? 0.6 : 1,
                              transition: 'all 0.2s'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <span style={{
                                  background: isDone ? '#51cf6622' : '#6c63ff22',
                                  color: isDone ? '#51cf66' : '#a78bfa',
                                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700
                                }}>Day {dayPlan.day}</span>
                                <label style={{ color: '#8b8ab0', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                  <input type="checkbox" checked={isDone}
                                    onChange={() => toggleDayComplete(roadmap._id, dayPlan.day)}
                                    style={{ cursor: 'pointer', accentColor: '#6c63ff' }} />
                                  {isDone ? 'Completed' : 'Mark done'}
                                </label>
                              </div>
                              <h4 style={{
                                color: isDone ? '#8b8ab0' : '#fff', fontSize: 15, fontWeight: 700,
                                margin: '0 0 6px', textDecoration: isDone ? 'line-through' : 'none'
                              }}>{dayPlan.topic}</h4>
                              <p style={{ color: isDone ? '#5d5c7f' : '#8b8ab0', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                                {dayPlan.activity}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Complete Button */}
                      <button onClick={() => handleComplete(roadmap._id)} style={{
                        width: '100%', padding: '13px',
                        background: 'linear-gradient(135deg, #51cf66, #2f9e44)',
                        border: 'none', borderRadius: 12, color: '#fff',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 20px #51cf6644'
                      }}>
                        ✅ Mark Roadmap as Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Active Roadmaps */}
        {activeRoadmaps.length === 0 && !generating && (
          <div style={{ background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 20, padding: '48px 24px', textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No Active Roadmaps</h3>
            <p style={{ color: '#8b8ab0', fontSize: 14, margin: '0 0 20px' }}>Take a quiz to identify weak topics, then generate your first AI roadmap!</p>
            <button onClick={() => navigate('/quiz')} style={{
              padding: '12px 32px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
              border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14
            }}>Take a Quiz First</button>
          </div>
        )}

        {/* Archive */}
        {archivedRoadmaps.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchive(!showArchive)}
              style={{ background: 'transparent', border: 'none', color: '#8b8ab0', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 14 }}>
              {showArchive ? '▲' : '▼'} Completed Archive ({archivedRoadmaps.length}/5)
            </button>

            {showArchive && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {archivedRoadmaps.map(roadmap => (
                  <div key={roadmap._id} style={{ background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ background: '#2d2b5a', color: '#8b8ab0', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {roadmap.subject}
                      </span>
                      <span style={{ background: '#51cf6611', color: '#51cf66', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        ✅ Completed
                      </span>
                      <span style={{ color: '#5d5c7f', fontSize: 12 }}>
                        Topics: {roadmap.weakTopics.map(t => t.topic).join(', ')}
                      </span>
                    </div>
                    <span style={{ color: '#5d5c7f', fontSize: 11 }}>
                      {new Date(roadmap.completedAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

const styles = {
  sidebar: { width: 220, background: '#13122e', display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 },
  sidebarLogo: { padding: '0 24px 32px', display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' },
  betaBadge: { fontSize: 9, background: '#6c63ff33', color: '#a78bfa', padding: '2px 6px', borderRadius: 20, fontWeight: 600 },
  sidebarFooterCard: { margin: '0 16px 16px', background: 'linear-gradient(135deg, #6c63ff22, #a78bfa22)', border: '1px solid #6c63ff44', borderRadius: 16, padding: '16px', textAlign: 'center' },
  footerCardBtn: { background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' },
  centerWorkspace: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginLeft: 220 },
  loadingSpinner: { width: '40px', height: '40px', border: '4px solid #2d2b5a', borderTop: '4px solid #6c63ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};