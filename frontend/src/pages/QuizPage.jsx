import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getQuestions, submitQuiz } from '../utils/api';
import { getUser } from '../utils/storage';

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [topicScores, setTopicScores] = useState({});
  const [topicCounts, setTopicCounts] = useState({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const subject = new URLSearchParams(location.search).get('subject') || 'Math';
  const user = getUser();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const difficulty = new URLSearchParams(location.search).get('difficulty') || 'easy';
        const res = await getQuestions(subject, difficulty);
        setQuestions(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [subject]);

  const handleAnswer = (option) => {
    setSelected(option);
  };

  const handleNext = async () => {
    const q = questions[current];
    if (!q) return null;
    const isCorrect = selected === q.answer;

    // Track topic scores
    setTopicScores(prev => ({
      ...prev,
      [q.topic]: (prev[q.topic] || 0) + (isCorrect ? 1 : 0)
    }));
    setTopicCounts(prev => ({
      ...prev,
      [q.topic]: (prev[q.topic] || 0) + 1
    }));

    if (isCorrect) setScore(prev => prev + 1);

    if (current + 1 < questions.length) {
      setCurrent(prev => prev + 1);
      setSelected(null);
    } else {
      // Calculate percentage per topic
      const finalScores = {};
      for (let topic in topicScores) {
        const correct = topicScores[topic] + (isCorrect && q.topic === topic ? 1 : 0);
        const total = topicCounts[topic] + (q.topic === topic ? 1 : 0);
        finalScores[topic] = Math.round((correct / total) * 100);
      }
    // console.log('Submitting quiz with userId:', user.id);
    // console.log('Topic scores:', finalScores);

      // Submit to backend
      try {
        await submitQuiz({
          userId: user.id,
          subject,
          topicScores: finalScores,
          totalScore: Math.round(((score + (isCorrect ? 1 : 0)) / questions.length) * 100)
        });
      } catch (err) {
        console.error(err);
      }
      setFinished(true);
    }
  };
    

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="text-indigo-600 text-xl font-medium">Loading questions...</div>
      </div>
    </div>
  );

  if (finished) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
          <p className="text-gray-500 mb-6">You scored {score} out of {questions.length}</p>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-4 mb-6">
            <p className="text-3xl font-bold">{Math.round((score / questions.length) * 100)}%</p>
            <p className="text-indigo-100">Total Score</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/weakness')}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all">
              See Weakness Report
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{subject}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
            {q.topic}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">{q.question}</h2>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${
                  selected === option
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                }`}>
                {option}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!selected}
            className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40">
            {current + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default QuizPage;