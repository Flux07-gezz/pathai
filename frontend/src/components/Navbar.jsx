import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/storage';

function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-indigo-600">PathAI</span>
        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">Beta</span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-indigo-600 font-medium transition-all">
          Dashboard
        </button>
        <button 
          onClick={() => navigate('/quiz')}
          className="text-gray-600 hover:text-indigo-600 font-medium transition-all">
          Quiz
        </button>
        <button 
          onClick={() => navigate('/weakness')}
          className="text-gray-600 hover:text-indigo-600 font-medium transition-all">
          Weakness
        </button>
        <button 
          onClick={() => navigate('/roadmap')}
          className="text-gray-600 hover:text-indigo-600 font-medium transition-all">
          Roadmap
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-all">
        Logout
      </button>

    </nav>
  );
}

export default Navbar;