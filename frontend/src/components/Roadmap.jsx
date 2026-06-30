import React, { useEffect, useState } from 'react';
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

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedDays, setCompletedDays] = useState({});
  const [activePath, setActivePath] = useState('/roadmap');
  
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchRoadmap = async () => {
        try {
          const rawToken = localStorage.getItem('token');
          if (!rawToken) return;
    
          const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
            ? JSON.parse(rawToken)
            : rawToken;
    
          // ✅ ONLY ONE FETCH CALL: No more calling the broken /api/auth/stats route!
          const response = await API.get('/roadmap');
    
          if (response.data.roadmap) {
            setRoadmap(response.data.roadmap);
            // Safely pull down checked states packed inside our updated backend payload!
            setCompletedDays(response.data.completedDays || []);
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

    fetchRoadmap();
  }, [navigate]);

  const toggleDayComplete = (dayNum) => {
    setCompletedDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }));
  };

  // ── LOADING STATE RENDER OVERLAY (Styled to fit theme) ──
  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={{ color: '#8b8ab0', marginTop: 16, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
          Analyzing performance & generating dynamic 7-Day NCERT study map...
        </p>
      </div>
    );
  }

  // ── ERROR OR EMPTY STATE RENDER OVERLAY (Styled to match dashboard fallback patterns) ──
  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
        <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700, textAlign: 'center', fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>No Roadmap Baseline Formed</p>
        <p style={{ color: '#8b8ab0', fontSize: '14px', textAlign: 'center', fontFamily: "'Inter', sans-serif", maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.5 }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={styles.errorBackBtn}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>

      {/* ── SIDEBAR (Identical to Dashboard layout metrics) ── */}
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

      {/* ── MAIN CONTENT ACCENT WORKSPACE ── */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px', overflowY: 'auto' }}>
        
        {/* Top Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
              AI Learning Roadmap 🤖
            </h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>
              Customized 7-day milestone curriculum synthesized using standard Indian NCERT reference documentation.
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

        {/* Timeline Stream Modules mapping layout cards */}
        <p style={{ color: '#8b8ab0', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Curriculum Schedule Sequence</p>
        
        <div style={styles.timeline}>
          {roadmap?.days?.map((dayPlan) => {
            const isDone = !!completedDays[dayPlan.day];
            return (
              <div key={dayPlan.day} style={{
                ...styles.timelineCard,
                borderLeft: isDone ? '4px solid #51cf66' : '4px solid #6c63ff',
                opacity: isDone ? 0.6 : 1
              }}>
                <div style={styles.cardHeader}>
                  <div style={{
                    ...styles.dayBadge,
                    background: isDone ? '#51cf6622' : '#6c63ff22',
                    color: isDone ? '#51cf66' : '#a78bfa'
                  }}>
                    Day {dayPlan.day}
                  </div>
                  <label style={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={isDone} 
                      onChange={() => toggleDayComplete(dayPlan.day)}
                      style={styles.checkbox}
                    />
                    {isDone ? 'Milestone Completed' : 'Mark as Done'}
                  </label>
                </div>

                <h3 style={{
                  ...styles.topicTitle,
                  textDecoration: isDone ? 'line-through' : 'none',
                  color: isDone ? '#8b8ab0' : '#fff'
                }}>
                  {dayPlan.topic}
                </h3>

                <p style={{
                  ...styles.activityText,
                  color: isDone ? '#5d5c7f' : '#8b8ab0'
                }}>{dayPlan.activity}</p>
              </div>
            );
          })}
        </div>
      </main>

    </div>
  );
}

const styles = {
  centerContainer: {
    minHeight: '100vh',
    background: '#0f0e2a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%'
  },
  timelineCard: {
    background: '#1e1d3f',
    border: '1px solid #2d2b5a',
    borderRadius: '16px',
    padding: '24px',
    transition: 'all 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  dayBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  checkboxLabel: {
    color: '#8b8ab0',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontWeight: 500
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: '#6c63ff',
    width: '15px',
    height: '15px'
  },
  topicTitle: {
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    fontFamily: "'Inter', sans-serif"
  },
  activityText: {
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0
  },
  errorBackBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    boxShadow: '0 4px 20px rgba(108, 99, 255, 0.4)'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #2d2b5a',
    borderTop: '4px solid #6c63ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};