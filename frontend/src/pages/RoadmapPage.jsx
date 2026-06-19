import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser } from '../utils/storage';

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Quiz', icon: '📝', path: '/quiz' },
  { label: 'Weakness', icon: '📊', path: '/weakness' },
  { label: 'Roadmap', icon: '🤖', path: '/roadmap' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedDays, setCompletedDays] = useState([]);
  const [activePath] = useState('/roadmap');
  const [resetting, setResetting] = useState(false);
  
  const navigate = useNavigate();
  const user = getUser();

  const fetchRoadmap = async () => {
    try {
      const rawToken = localStorage.getItem('token');
      if (!rawToken) return;

      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
        ? JSON.parse(rawToken)
        : rawToken;

      // Single server request containing both the AI calendar object and checked status vectors
      const response = await axios.get('http://localhost:5000/api/roadmap', {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });

      if (response.data.roadmap) {
        setRoadmap(response.data.roadmap);
        setCompletedDays(response.data.completedDays || []);
        setError('');
      } else {
        setError(response.data.message || 'No active weak topics identified! Complete an exam to build your path.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to contact the AI compiler. Please check if your backend server routes are active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRoadmap();
  }, [navigate, user]);

  const toggleDayComplete = async (dayNum) => {
    try {
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"') ? JSON.parse(rawToken) : rawToken;

      setCompletedDays(prev => 
        prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
      );

      await axios.post('http://localhost:5000/api/roadmap/toggle-day', { dayNum }, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
    } catch (err) {
      console.error("Failed to sync checkbox state status:", err);
    }
  };

  const handleResetRoadmap = async () => {
    if (!window.confirm("Do you want to clear your current plan and build a new roadmap based on your latest scores?")) return;
    setResetting(true);
    try {
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"') ? JSON.parse(rawToken) : rawToken;

      await axios.post('http://localhost:5000/api/roadmap/reset', {}, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      
      setError('');
      setRoadmap(null);
      setCompletedDays([]);
      setLoading(true);
      await fetchRoadmap();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  // ── LOADING STATE WITHIN SIDEBAR FRAMEWORK ──
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
          <p style={{ color: '#8b8ab0', marginTop: 16, fontSize: 14 }}>Synthesizing custom 7-Day study plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>

      {/* ── PERSISTENT SIDEBAR PANEL ── */}
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
              <div key={item.path} onClick={() => { navigate(item.path); }} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 24px', cursor: 'pointer', margin: '2px 12px', borderRadius: 12, transition: 'all 0.2s',
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

      {/* ── ACCENT WORKSPACE FRAME ── */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* ── TOP BAR HEADER ROW (Spans full width matching layout grids precisely) ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, width: '100%' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>AI Learning Roadmap 🤖</h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>
              Dynamic 7-day master study itinerary tracking metrics locked inside your database profile.
            </p>
          </div>
          
          <button 
            onClick={handleResetRoadmap}
            disabled={resetting}
            style={{ padding: '10px 16px', background: '#ff6b6b11', border: '1px solid #ff6b6b33', color: '#ff6b6b', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {resetting ? 'Resetting...' : 'Re-Generate New Roadmap 🔄'}
          </button>
        </div>

        {/* ── CENTRAL CONTENT LAYOUT MATRIX ── */}
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {error ? (
            /* CASE 1: NO ACTIVE COMPILING RECORD CARD FOUND (Boxed Centered Layout) */
            <div style={styles.innerErrorCard}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>No Roadmap Formed</h3>
              <p style={{ color: '#8b8ab0', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5', maxWidth: '440px' }}>{error}</p>
              <button onClick={() => navigate('/dashboard')} style={styles.innerCardBtn}>
                Go to Dashboard
              </button>
            </div>
          ) : (
            /* CASE 2: LIVE PERSISTENT TIMELINE GENERATED DISPLAY LIST (Boxed Centered Layout) */
            <div style={{ maxWidth: '680px', width: '100%' }}>
              <p style={{ color: '#8b8ab0', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Study Milestones</p>
              <div style={styles.timeline}>
                {roadmap?.days?.map((dayPlan) => {
                  const isDone = completedDays.includes(dayPlan.day);
                  return (
                    <div key={dayPlan.day} style={{ ...styles.timelineCard, borderLeft: isDone ? '4px solid #51cf66' : '4px solid #6c63ff', opacity: isDone ? 0.6 : 1 }}>
                      <div style={styles.cardHeader}>
                        <div style={{ ...styles.dayBadge, background: isDone ? '#51cf6622' : '#6c63ff22', color: isDone ? '#51cf66' : '#a78bfa' }}>Day {dayPlan.day}</div>
                        <label style={styles.checkboxLabel}>
                          <input type="checkbox" checked={isDone} onChange={() => toggleDayComplete(dayPlan.day)} style={styles.checkbox} />
                          {isDone ? 'Completed' : 'Mark Task Done'}
                        </label>
                      </div>
                      <h3 style={{ ...styles.topicTitle, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#8b8ab0' : '#fff' }}>{dayPlan.topic}</h3>
                      <p style={{ ...styles.activityText, color: isDone ? '#5d5c7f' : '#8b8ab0' }}>{dayPlan.activity}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
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
  innerErrorCard: { background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: '20px', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '680px', width: '100%', margin: '40px auto 0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  innerCardBtn: { padding: '12px 32px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 20px rgba(108, 99, 255, 0.3)' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  timelineCard: { background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: '16px', padding: '24px', transition: 'all 0.2s ease' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  dayBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' },
  checkboxLabel: { color: '#8b8ab0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 },
  checkbox: { cursor: 'pointer', width: '15px', height: '15px', accentColor: '#6c63ff' },
  topicTitle: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' },
  activityText: { fontSize: '14px', lineHeight: '1.6', margin: 0 },
  loadingSpinner: { width: '40px', height: '40px', border: '4px solid #2d2b5a', borderTop: '4px solid #6c63ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};