import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getRoadmap } from '../utils/api';
import { getUser, saveToLocal, getFromLocal } from '../utils/storage';

function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Load cached roadmap if available
    const cached = getFromLocal('roadmap');
    if (cached) setRoadmap(cached);
  }, []);

  const generateRoadmap = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRoadmap(user.id);
      if (res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        saveToLocal('roadmap', res.data.roadmap);
      } else {
        setError('No weak topics found! Take a quiz first.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-1">AI Study Roadmap 🤖</h1>
          <p className="text-indigo-100">Your personalized 7-day study plan</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        {!roadmap && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center mb-8">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Generate Your Study Plan
            </h2>
            <p className="text-gray-500 mb-6">
              Our AI will analyze your weak topics and create a personalized 7-day roadmap
            </p>
            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? '🤖 AI is thinking...' : 'Generate Roadmap'}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center mb-8">
            <div className="text-5xl mb-4 animate-bounce">🤖</div>
            <p className="text-indigo-600 font-medium">AI is generating your personalized study plan...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Roadmap Days */}
        {roadmap && !loading && (
          <div>
            <div className="space-y-4 mb-6">
              {roadmap.days.map((day, index) => (
                <div key={index} 
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{day.topic}</h3>
                      <p className="text-gray-500 text-sm">{day.activity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Regenerate Button */}
            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all">
              🔄 Regenerate Roadmap
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default RoadmapPage;