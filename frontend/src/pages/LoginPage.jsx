import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/api';
import { saveUser } from '../utils/storage';
import { useLang } from '../LanguageContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { lang, toggleLang } = useLang();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isLogin) {
        const res = await login({ email, password });
        saveUser(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        await register({ name, email, password });
        setSuccess('Account created! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '🧠', text: 'AI-generated quizzes' },
    { icon: '📊', text: 'Smart weakness detection' },
    { icon: '🗺️', text: 'Personalized roadmaps' },
    { icon: '📶', text: 'Resilient to low connectivity' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e2a', fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', position: 'relative', overflow: 'hidden' }}>

        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: '#6c63ff08', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: '#a78bfa08', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff' }}>P</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>PathAI</span>
          <span style={{ fontSize: 10, background: '#6c63ff33', color: '#a78bfa', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Beta</span>
        </div>

        {/* Headline */}
        <h1 style={{ color: '#fff', fontSize: 38, fontWeight: 700, margin: '0 0 16px', lineHeight: 1.2 }}>
          Learn smarter,<br />
          <span style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            not harder.
          </span>
        </h1>
        <p style={{ color: '#8b8ab0', fontSize: 15, margin: '0 0 48px', lineHeight: 1.6, maxWidth: 360 }}>
          AI-powered personalized learning for every student. Identify your weak topics and get a custom 7-day study plan.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1e1d3f', border: '1px solid #2d2b5a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {f.icon}
              </div>
              <span style={{ color: '#c4c3dc', fontSize: 14 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Samsung badge */}
        <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#51cf66' }} />
          <span style={{ color: '#5d5c7f', fontSize: 12 }}>Samsung Solve for Tomorrow 2026</span>
        </div>
      </div>

      {/* RIGHT PANEL — Login form */}
      <div style={{ width: 480, background: '#13122e', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', borderLeft: '1px solid #2d2b5a' }}>

        {/* Language toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <button onClick={toggleLang} style={{ background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 10, padding: '7px 14px', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
          </button>
        </div>

        {/* Heading */}
        <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ color: '#8b8ab0', fontSize: 14, margin: '0 0 32px' }}>
          {isLogin ? 'Sign in to continue your learning journey' : 'Start your personalized learning journey'}
        </p>

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: '#1e1d3f', borderRadius: 12, padding: 4, marginBottom: 28, border: '1px solid #2d2b5a' }}>
          <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: isLogin ? 'linear-gradient(135deg, #6c63ff, #8b5cf6)' : 'transparent', color: isLogin ? '#fff' : '#8b8ab0', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
            Login
          </button>
          <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: !isLogin ? 'linear-gradient(135deg, #6c63ff, #8b5cf6)' : 'transparent', color: !isLogin ? '#fff' : '#8b8ab0', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
            Register
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ background: '#ff6b6b11', border: '1px solid #ff6b6b33', color: '#ff6b6b', padding: '12px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#51cf6611', border: '1px solid #51cf6633', color: '#51cf66', padding: '12px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            ✅ {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {!isLogin && (
            <div>
              <label style={{ color: '#8b8ab0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Anshu Raj"
                required
                style={{ width: '100%', padding: '13px 16px', background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#6c63ff'}
                onBlur={e => e.target.style.borderColor = '#2d2b5a'}
              />
            </div>
          )}

          <div>
            <label style={{ color: '#8b8ab0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: '100%', padding: '13px 16px', background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#6c63ff'}
              onBlur={e => e.target.style.borderColor = '#2d2b5a'}
            />
          </div>

          <div>
            <label style={{ color: '#8b8ab0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ width: '100%', padding: '13px 48px 13px 16px', background: '#1e1d3f', border: '1px solid #2d2b5a', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#6c63ff'}
                onBlur={e => e.target.style.borderColor = '#2d2b5a'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8b8ab0', cursor: 'pointer', fontSize: 16, padding: 0 }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#2d2b5a' : 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: 12, color: loading ? '#5d5c7f' : '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, boxShadow: loading ? 'none' : '0 4px 20px #6c63ff44', transition: 'all 0.2s' }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign in →' : 'Create account →'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ color: '#5d5c7f', fontSize: 12, textAlign: 'center', marginTop: 28 }}>
          By continuing you agree to our terms of service
        </p>
      </div>
    </div>
  );
}