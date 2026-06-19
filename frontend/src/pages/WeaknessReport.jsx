import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWeakTopics } from '../utils/api';
import { getUser } from '../utils/storage';

function WeaknessReport() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    const fetchWeaknessMetrics = async () => {
      try {
        setLoading(true);
        // Requesting your analytical report records through the local server port bridge
        const res = await getWeakTopics(user?.id || user?._id);
        
        if (res && res.data) {
          setReports(res.data);
        }
      } catch (err) {
        console.error("Failed to parse historical syllabus metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id || user?._id) {
      fetchWeaknessMetrics();
    } else {
      setLoading(false);
    }
  }, []);

  // 1. LOADING RENDER GUARD (Prevents premature compilation layout crashes)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-indigo-600 text-xl font-medium">Compiling focus areas report analytics...</div>
        </div>
      </div>
    );
  }

  const subjects = Object.keys(reports || {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Header Block */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weakness Analysis</h1>
            <p className="text-gray-500 mt-1">
              Target focus topics pinpointed by AI based on your completed {user?.educationBoard || 'CBSE'} quiz evaluations.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
          >
            Back to Dashboard
          </button>
        </div>

        {/* 2. EMPTY METRICS SAFEGUARD BLOCK */}
        {subjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-gray-800">Your profile report is clean!</h2>
            <p className="text-gray-500 max-w-md mx-auto mt-2 mb-6">
              Complete more multiple choice chapters quizzes to unlock deep syllabus weakness performance trackers here.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all"
            >
              Start Practice Quiz Now
            </button>
          </div>
        ) : (
          /* 3. PROTECTED RENDERING MAP ENGINE LOOP */
          <div className="space-y-6">
            {subjects.map((subjectName) => {
              const topicList = reports[subjectName] || [];
              if (topicList.length === 0) return null;

              return (
                <div key={subjectName} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    {subjectName} Focus Fields
                  </h2>
                  
                  <div className="flex flex-wrap gap-3">
                    {topicList.map((topicItem, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigate(`/quiz?subject=${subjectName}&topic=${topicItem}`)}
                        className="bg-red-50 text-red-700 border border-red-100 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover:bg-red-100 transition-all flex items-center gap-2"
                      >
                        <span>⚠️</span>
                        <span>{topicItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default WeaknessReport;