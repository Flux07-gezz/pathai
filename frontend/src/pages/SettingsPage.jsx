import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser, saveToLocal } from '../utils/storage';
import {API} from '../utils/api';

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Quiz', icon: '📝', path: '/quiz' },
  { label: 'Weakness', icon: '📊', path: '/weakness' },
  { label: 'Roadmap', icon: '🤖', path: '/roadmap' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

const availableClasses = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = getUser();

  const [selectedClass, setSelectedClass] = useState(user?.studentClass || 'Class 7');
  const [updating, setUpdating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [activePath] = useState('/settings');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // ── UPDATE CLASS LEVEL IN DB ──
  const handleUpdateClass = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"') ? JSON.parse(rawToken) : rawToken;

      // Make a call to update user profile details
      await API.post('/auth/update-profile', { studentClass: selectedClass });

      // Update local storage object so header updates instantly without relogging
      const updatedUser = { ...user, studentClass: selectedClass };
      saveToLocal('user', updatedUser);
      
      alert(`Academic target successfully shifted to ${selectedClass}!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update class parameters.');
    } finally {
      setUpdating(false);
    }
  };

  // ── DANGER ZONE: FLUSH QUIZ HISTORY & WEAKNESSES ──
  const handleResetData = async () => {
    if (!window.confirm("CRITICAL ACCENT: Are you absolutely sure you want to flush all quiz scores, saved roadmaps, and weakness logs? This cannot be undone.")) return;
    setClearing(true);
    try {
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"') ? JSON.parse(rawToken) : rawToken;

      await API.post('/quiz/clear-history', {});

      alert("Workspace parameters flushed successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to clear data records.");
    } finally {
      setClearing(false);
    }
  };

  // ── LOGOUT TRIGGER ──
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('weakTopics');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>

      {/* ── PERSISTENT SIDEBAR ── */}
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

      {/* ── MAIN WORKSPACE ── */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, width: '100%' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>System Settings ⚙️</h1>
            <p style={{ color: '#8b8ab0', fontSize: 13, margin: '4px 0 0' }}>Configure academic parameters and manage account variables.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#a78bfa', background: '#6c63ff22', padding: '6px 14px', borderRadius: 20, fontWeight: 600 }}>
              {user?.studentClass || 'Class 7'}
            </span>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* ── SETTINGS CORE PANEL BLOCKS ── */}
        <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section A: Academic Configuration */}
          <div style={styles.settingsCard}>
            <h3 style={styles.sectionTitle}>Academic Configuration</h3>
            <p style={styles.sectionDesc}>Select your active grade level. Quizzes and AI Roadmaps will automatically adapt to your chosen target syllabus difficulty.</p>
            
            <form onSubmit={handleUpdateClass} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                style={styles.selectInput}
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls} style={{ background: '#13122e', color: '#fff' }}>{cls}</option>
                ))}
              </select>
              <button type="submit" disabled={updating} style={styles.saveBtn}>
                {updating ? 'Saving...' : 'Update Class'}
              </button>
            </form>
          </div>

          {/* Section B: Profile Information */}
          <div style={styles.settingsCard}>
            <h3 style={styles.sectionTitle}>Account Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Full Name</span>
                <span style={styles.infoValue}>{user?.name || 'Academic Student'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email Address</span>
                <span style={styles.infoValue}>{user?.email || 'student@pathai.com'}</span>
              </div>
            </div>
          </div>

          {/* Section C: Account Management / Danger Zone */}
          <div style={{ ...styles.settingsCard, border: '1px solid #ff6b6b33' }}>
            <h3 style={{ ...styles.sectionTitle, color: '#ff6b6b' }}>Danger Zone</h3>
            <p style={styles.sectionDesc}>Reset your dashboard metrics or securely close out your active access session tokens.</p>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
              <button onClick={handleResetData} disabled={clearing} style={styles.dangerBtn}>
                {clearing ? 'Clearing History...' : 'Clear All Quiz Data 🗑️'}
              </button>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Log Out Securely 🚪
              </button>
            </div>
          </div>

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
  settingsCard: { background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: '16px', padding: '24px' },
  sectionTitle: { color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0' },
  sectionDesc: { color: '#8b8ab0', fontSize: '13px', lineHeight: '1.5', margin: 0 },
  selectInput: { flex: 1, padding: '12px', background: '#13122e', border: '1px solid #2d2b5a', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' },
  saveBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(108, 99, 255, 0.3)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#13122e', borderRadius: '12px', border: '1px solid #2d2b5a' },
  infoLabel: { color: '#8b8ab0', fontSize: '13px', fontWeight: 500 },
  infoValue: { color: '#fff', fontSize: '13px', fontWeight: 600 },
  dangerBtn: { padding: '12px 20px', background: '#ff6b6b11', border: '1px solid #ff6b6b44', color: '#ff6b6b', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  logoutBtn: { padding: '12px 20px', background: '#2d2b5a', border: 'none', color: '#fff', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
};