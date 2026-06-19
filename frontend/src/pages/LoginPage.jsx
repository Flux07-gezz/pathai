import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/api';
import { saveUser } from '../utils/storage';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await login({ email, password });
        
        // Dynamic fallback: Extracts data correctly whether it's wrapped in res.data or directly in res
        const activeToken = res?.data?.token || res?.token;
        const activeUser = res?.data?.user || res?.user;

        if (!activeToken || !activeUser) {
          setError('Authentication payload structural mismatch. Missing user or token properties.');
          setLoading(false);
          return;
        }

        // Commit both the clean user data object and the token string to storage utilities
        saveUser(activeUser, activeToken);
        
        console.log("Token securely saved into client memory:", activeToken);

        // Direct routing based on active profile onboarding configuration status
        if (!activeUser.studentClass) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        await register({ name, email, password });
        setIsLogin(true);
        setError('Registered successfully! Please login.');
      }
    } catch (err) {
      console.error("Login submission failure logs:", err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify your connection or credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Logo Banner */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600">PathAI</h1>
          <p className="text-gray-500 mt-2">Your personal study companion</p>
        </div>

        {/* Toggle Login/Register Interfaces */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              isLogin ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              !isLogin ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Notification Alert Block */}
        {error && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            error.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Submission Form Context */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default LoginPage;