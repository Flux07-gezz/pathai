import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getQuestions, submitQuiz } from '../utils/api';
import { getUser } from '../utils/storage';

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // Extract query variables from the URL router grid
  const searchParams = new URLSearchParams(location.search);
  const subject = searchParams.get('subject') || 'Math';
  const topic = searchParams.get('topic') || 'General';

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        // Pass user ID, subject, and topic filters directly to your 127.0.0.1 tunnel
        const res = await getQuestions(user?.id || user?._id, subject, topic);
        
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setQuestions(res.data);
        } else {
          console.warn("Backend array empty, applying local UI safeguards.");
        }
      } catch (err) {
        console.error("Error pulling quiz data details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id || user?._id) {
      fetchQuizData();
    } else {
      setLoading(false);
    }
  }, [subject, topic]);

  const handleAnswer = (option) => {
    setSelected(option);
  };

  const handleNext = async () => {
    const q = questions[current];
    const isCorrect = selected === q?.correctAnswer;
    let newScore = score;

    if (isCorrect) {
      newScore = score + 1;
      setScore(prev => prev + 1);
    }

    if (current + 1 < questions.length) {
      setCurrent(prev => prev + 1);
      setSelected(null);
    } else {
      setLoading(true);
      try {
        // Submit complete score evaluations matrix back to MongoDB 
        await submitQuiz({
          userId: user?.id || user?._id,
          subject,
          totalScore: Math.round((newScore / questions.length) * 100),
          questionsData: questions
        });
      } catch (err) {
        console.error("Submission layout sync failed:", err);
      }
      setLoading(false);
      setFinished(true);
    }
  };

  // 1. LOADER STATUS GUARD (Prevents reading properties of empty elements during network flight)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-indigo-600 text-xl font-medium">Compiling dynamic CBSE/ICSE target questions...</div>
        </div>
      </div>
    );
  }

  // 2. EMPTY DATA DATASET SAFEGUARD
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <h2 className="text-xl font-bold text-gray-800">No questions found</h2>
          <p className="text-gray-500 mt-2 mb-6">Could not connect to your backend profile or AI engine rules.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 3. FINISHED CARD VIEW SCORECARD DISPLAY
  if (finished) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
            <p className="text-gray-500 mb-6">You scored {score} out of {questions.length}</p>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-4 mb-6">
              <p className="text-3xl font-bold">{Math.round((score / questions.length) * 100)}%</p>
              <p className="text-indigo-100">Syllabus Master Rating</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => navigate('/weakness')} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all">
                See Weakness Report
              </button>
              <button onClick={() => navigate('/dashboard')} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe extraction pointer mapping with clean fallback properties
  const q = questions[current] || { questionText: '', options: [], topic: '' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Progress Timeline Header */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {current + 1} of {questions.length}</span>
            <span className="font-semibold text-indigo-600 uppercase text-xs">
              {user?.educationBoard || 'CBSE'} • {user?.studentLevel || 'Class 10'}
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Display Card Frame */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
            {q.topic || topic || subject}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">{q.questionText}</h2>

          {/* Option Multiple Choice Grid Layout */}
          <div className="space-y-3">
            {q.options && q.options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAnswer(option)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${
                  selected === option
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Action Trigger Navigation Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={!selected}
            className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40"
          >
            {current + 1 === questions.length ? 'Finish Quiz Assessment' : 'Next Question'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default QuizPage;