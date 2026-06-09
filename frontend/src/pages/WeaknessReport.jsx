import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWeakTopics } from '../utils/api';
import { getUser, saveToLocal, getFromLocal } from '../utils/storage';

function WeaknessReport() {
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();
 // console.log('User:', user);


    useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    const fetchWeakTopics = async () => {
        try {
            console.log('Fetching for userId:', user.id);
            const res = await getWeakTopics(user.id);
            console.log('Response:', res.data);
            setWeakTopics(res.data);
            saveToLocal('weakTopics', res.data);
            setLoading(false);
        } catch (err) {
            console.log('Error:', err.message);
            const cached = getFromLocal('weakTopics');
            if (cached) setWeakTopics(cached);
            setLoading(false);
        }
    };
    fetchWeakTopics();
    }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-1">Weakness Report 📊</h1>
          <p className="text-indigo-100">Topics that need more practice</p>
        </div>

        {loading ? (
          <div className="text-center text-indigo-600 font-medium">Loading...</div>
        ) : weakTopics.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No weak topics found!</h2>
            <p className="text-gray-500 mb-6">Take a quiz first to see your weakness report</p>
            <button
              onClick={() => navigate('/quiz')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all">
              Take a Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {weakTopics.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{item.topic}</h3>
                    <p className="text-sm text-gray-500">{item.subject}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.score < 30 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {item.score}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.score < 30 ? 'bg-red-400' : 'bg-yellow-400'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Generate Roadmap Button */}
            <button
              onClick={() => navigate('/roadmap')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all mt-4">
              🤖 Generate AI Study Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeaknessReport;