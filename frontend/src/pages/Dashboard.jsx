import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUser } from '../utils/storage';
import { useLang } from '../LanguageContext';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { t } = useLang();

  useEffect(() => {
    const loggedInUser = getUser();
    if (!loggedInUser) {
      navigate('/login');
    } else {
      setUser(loggedInUser);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-1">
            {t('welcomeBack')}, {user?.name} 👋
          </h1>
          <p className="text-indigo-100">{t('readyToStudy')}</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div 
            onClick={() => navigate('/quiz')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100">
            <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{t('takeQuiz')}</h3>
            <p className="text-gray-500 text-sm">Test your knowledge and find weak areas</p>
          </div>

          <div 
            onClick={() => navigate('/weakness')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{t('weaknessReport')}</h3>
            <p className="text-gray-500 text-sm">See which topics need more practice</p>
          </div>

          <div 
            onClick={() => navigate('/roadmap')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100">
            <div className="bg-pink-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{t('aiRoadmap')}</h3>
            <p className="text-gray-500 text-sm">Get your personalized 7-day study plan</p>
          </div>

        </div>

        {/* Subjects Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('chooseSubject')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Math', 'Science', 'English', 'History'].map((subject) => (
              <button
                key={subject}
                onClick={() => navigate(`/quiz?subject=${subject}`)}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-medium hover:opacity-90 transition-all">
                {subject}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;