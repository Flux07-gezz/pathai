import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser, saveUser } from '../utils/storage';
import { updateOnboardingClass } from '../utils/api';


export default function Onboarding() {
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const u = getUser();
    // Redirect to login if user object isn't present at all
    if (!u) {
      navigate('/login');
    } else if (u.studentClass) {
      // If they already have a class set up, skip onboarding entirely
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      setError('Please choose a class to customize your curriculum.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Pull the raw item from storage
      const rawToken = localStorage.getItem('token');
      
      if (!rawToken) {
        setError('Session expired. Please log out and login again.');
        setLoading(false);
        return;
      }

      // 2. Strips away JSON stringify quotes if they exist around the text
      const cleanToken = rawToken.startsWith('"') && rawToken.endsWith('"')
        ? JSON.parse(rawToken)
        : rawToken;

      // Send the selection to your backend route directly
      console.log('Token before update-class:', localStorage.getItem('token'));
      await updateOnboardingClass({ studentClass });
      const response = await updateOnboardingClass({ studentClass: selectedClass });
      

      // Fetch current local user state frame
      const currentUser = getUser();
      const updatedUser = { ...currentUser, studentClass: response.data.user.studentClass };
      
      // Save user state back along with the clean token payload
      saveUser(updatedUser, cleanToken);

      // Take them to the dynamic search dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Onboarding Error Context:", err);
      
      const serverMessage = err.response?.data?.message;
      const serverStatus = err.response?.status;
      
      setError(
        serverMessage 
          ? `Server Error (${serverStatus}): ${serverMessage}` 
          : 'Failed to update your profile. Please check if your backend is running on Port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const ncertClasses = [
    'Class 6', 'Class 7', 'Class 8', 
    'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0e2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    }}>
      <div style={{
        background: '#1e1d3f',
        border: '1px solid #2d2b5a',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        textAlign: 'center'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 800, color: '#fff'
          }}>P</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '22px' }}>PathAI</span>
        </div>

        <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 12px 0', fontWeight: 700 }}>
          Personalize Your Learning
        </h2>
        
        <p style={{ color: '#8b8ab0', fontSize: '14px', margin: '0 0 32px 0', lineHeight: '1.5' }}>
          Welcome! To align your personalized learning companion with the official <strong>Indian NCERT Syllabus</strong>, please select your current academic class.
        </p>

        {error && (
          <div style={{
            background: '#ff6b6b22', border: '1px solid #ff6b6b44', color: '#ff6b6b',
            borderRadius: '12px', padding: '12px', fontSize: '13px', marginBottom: '20px',
            textAlign: 'left', lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select NCERT Grade
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#13122e',
                  border: '1.5px solid #2d2b5a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none'
                }}
              >
                <option value="" disabled style={{ color: '#8b8ab0' }}>-- Choose your Class --</option>
                {ncertClasses.map(cls => (
                  <option key={cls} value={cls} style={{ background: '#1e1d3f', color: '#fff' }}>
                    {cls}
                  </option>
                ))}
              </select>
              <div style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                color: '#8b8ab0', pointerEvents: 'none', fontSize: '12px'
              }}>▼</div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !selectedClass}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: selectedClass ? 'pointer' : 'not-allowed',
              opacity: selectedClass ? 1 : 0.6,
              boxShadow: selectedClass ? '0 4px 20px rgba(108, 99, 255, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Setting up Workspace...' : 'Configure My Path →'}
          </button>
        </form>
      </div>
    </div>
  );
}