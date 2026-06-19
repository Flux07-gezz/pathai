// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { login, register } from '../utils/api';
// import { saveUser } from '../utils/storage';

// function LoginPage() {
//   const [studentLevel, setStudentLevel] = useState('Class 10');
//   const [educationBoard, setEducationBoard] = useState('CBSE');
//   const [isLogin, setIsLogin] = useState(true);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       if (isLogin) {
//         const res = await login({ email, password });
//         saveUser(res.data.user, res.data.token);
//         navigate('/dashboard');
//       } else {
//         // Enforcing structured profile updates to handle dynamic board curricula paths
//         await register({ name, email, password, studentLevel, educationBoard });
//         setIsLogin(true);
//         setError('Registered successfully! Please login.');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-indigo-600">PathAI</h1>
//           <p className="text-gray-500 mt-2">Your personal study companion</p>
//         </div>

//         {/* Toggle Login/Register */}
//         <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
//           <button
//             type="button"
//             onClick={() => { setIsLogin(true); setError(''); }}
//             className={`flex-1 py-2 rounded-lg font-medium transition-all ${
//               isLogin ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
//             }`}
//           >
//             Login
//           </button>
//           <button
//             type="button"
//             onClick={() => { setIsLogin(false); setError(''); }}
//             className={`flex-1 py-2 rounded-lg font-medium transition-all ${
//               !isLogin ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
//             }`}
//           >
//             Register
//           </button>
//         </div>

//         {/* Error/Success Status Banner Notification */}
//         {error && (
//           <div className={`p-3 rounded-lg mb-4 text-sm ${
//             error.includes('successfully') 
//               ? 'bg-green-100 text-green-700' 
//               : 'bg-red-100 text-red-700'
//           }`}>
//             {error}
//           </div>
//         )}

//         {/* Form Container */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {!isLogin && (
//             <div>
//               <label className="text-sm font-medium text-gray-700">Name</label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Enter your name"
//                 className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                 required
//               />
//             </div>
//           )}

//           <div>
//             <label className="text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
//               required
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
//               required
//             />
//           </div>

//           {/* DYNAMIC REGISTRATION SELECTION OPTIONS FORM FIELDS */}
//           {!isLogin && (
//             <>
//               <div>
//                 <label className="text-sm font-medium text-gray-700">Education Board</label>
//                 <select
//                   value={educationBoard}
//                   onChange={(e) => setEducationBoard(e.target.value)}
//                   className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                 >
//                   <option value="CBSE">CBSE (NCERT Curriculum)</option>
//                   <option value="ICSE">ICSE / ISC Board</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-gray-700">Class / Grade Level</label>
//                 <select
//                   value={studentLevel}
//                   onChange={(e) => setStudentLevel(e.target.value)}
//                   className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                 >
//                   <option value="Class 9">Class 9</option>
//                   <option value="Class 10">Class 10</option>
//                   <option value="Class 11">Class 11</option>
//                   <option value="Class 12">Class 12</option>
//                 </select>
//               </div>
//             </>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6"
//           >
//             {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
//           </button>
//         </form>

//       </div>
//     </div>
//   );
// }

// export default LoginPage;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/api';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [educationBoard, setEducationBoard] = useState('CBSE');
  const [studentLevel, setStudentLevel] = useState('Class 7');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login({ email, password });
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        const res = await register({ name, email, password, educationBoard, studentLevel });
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0c1b] text-gray-100 flex items-center justify-center p-6 font-sans antialiased">
      <div className="absolute inset-0 bg-radial-gradient from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#1d1b36]/60 border border-[#2e2a56] rounded-2xl p-8 backdrop-blur-md shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 shadow-lg shadow-indigo-950/50">
            P
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back to PathAI' : 'Create Your Account'}
          </h2>
          <p className="text-gray-400 text-xs mt-1.5">
            {isLogin ? 'Sign in to resume your adaptive curriculum path' : 'Unlock specialized exam preparation tools'}
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-medium p-3.5 rounded-xl flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#131126]/60 border border-[#2e2a56] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full bg-[#131126]/60 border border-[#2e2a56] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Secure Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#131126]/60 border border-[#2e2a56] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Curriculum Board</label>
                <select
                  value={educationBoard}
                  onChange={(e) => setEducationBoard(e.target.value)}
                  className="w-full bg-[#131126]/60 border border-[#2e2a56] rounded-xl px-3 py-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="CBSE">CBSE (NCERT)</option>
                  <option value="ICSE">ICSE / ISC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Target Class</label>
                <select
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value)}
                  className="w-full bg-[#131126]/60 border border-[#2e2a56] rounded-xl px-3 py-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 shadow-lg shadow-indigo-950/50 hover:opacity-95"
          >
            {loading ? 'Processing Transaction...' : isLogin ? 'Sign In →' : 'Complete Registration →'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#2e2a56] text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-all"
          >
            {isLogin ? "Don't have an account? Create one here" : "Already registered? Access login portal"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;