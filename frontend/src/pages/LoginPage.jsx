import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/api';
import { saveUser } from '../utils/storage';

function LoginPage() {
  const [studentLevel, setStudentLevel] = useState('Class 10');
  const [educationBoard, setEducationBoard] = useState('CBSE');
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
        saveUser(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        // Enforcing structured profile updates to handle dynamic board curricula paths
        await register({ name, email, password, studentLevel, educationBoard });
        setIsLogin(true);
        setError('Registered successfully! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600">PathAI</h1>
          <p className="text-gray-500 mt-2">Your personal study companion</p>
        </div>

        {/* Toggle Login/Register */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              isLogin ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              !isLogin ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error/Success Status Banner Notification */}
        {error && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            error.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Form Container */}
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

          {/* DYNAMIC REGISTRATION SELECTION OPTIONS FORM FIELDS */}
          {!isLogin && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Education Board</label>
                <select
                  value={educationBoard}
                  onChange={(e) => setEducationBoard(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="CBSE">CBSE (NCERT Curriculum)</option>
                  <option value="ICSE">ICSE / ISC Board</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Class / Grade Level</label>
                <select
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default LoginPage;