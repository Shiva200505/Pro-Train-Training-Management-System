import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizzes, startQuiz, submitQuizResponse, completeQuiz } from '../services/api';

const Quiz = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  useEffect(() => {
    fetchQuizzes();
  }, [trainingId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getQuizzes(trainingId);
      setQuizzes(response);
      if (response.length > 0) {
        setCurrentQuiz(response[0]);
      }
    } catch (err) {
      setError('Failed to fetch quizzes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer handler
  const startTimer = useCallback((duration) => {
    setTimeLeft(duration * 60); // Convert minutes to seconds
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          handleSubmit(true); // Auto-submit when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = async (quizId) => {
    try {
      setLoading(true);
      const response = await startQuiz(quizId);
      setAttemptId(response.attemptId);
      setSuccess('Quiz started successfully');
      startTimer(currentQuiz.duration);
    } catch (err) {
      setError('Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    try {
      setLoading(true);
      setError('');
      
      if (autoSubmit) {
        setSuccess('Time is up! Submitting your answers automatically.');
      }
      
      // Submit each answer
      for (const [questionId, answer] of Object.entries(answers)) {
        await submitQuizResponse({
          attemptId,
          questionId,
          answer
        });
      }
      
      // Complete the quiz
      const result = await completeQuiz(attemptId);
      
      const message = autoSubmit 
        ? `Time's up! Your score: ${result.score}%`
        : `Quiz completed! Your score: ${result.score}%`;
        
      setSuccess(message);
      if (result.score >= currentQuiz.passingScore) {
        navigate(`/app/trainings/${trainingId}/certificate`);
      }
    } catch (err) {
      setError('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">No quizzes available</h2>
          <p className="text-gray-600 mt-2">There are no quizzes available for this training yet.</p>
          <button
            onClick={() => navigate(`/app/trainings/${trainingId}`)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Training
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{currentQuiz.title}</h1>
              <p className="text-gray-600 mt-2">{currentQuiz.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>Time Limit: {currentQuiz.duration} minutes</p>
                <p>Passing Score: {currentQuiz.passingScore}%</p>
              </div>
            </div>
            {attemptId && timeLeft !== null && (
              <div className={`text-xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
                Time Left: {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {!attemptId ? (
          <button
            onClick={() => navigate(`/app/quizzes/${currentQuiz.id}/take`)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Starting Quiz...' : 'Start Quiz'}
          </button>
        ) : (
          <div className="space-y-6">
            {currentQuiz.questions?.map((question, index) => (
              <div key={question.id} className="p-4 border border-gray-200 rounded">
                <p className="font-medium text-gray-800">
                  {index + 1}. {question.question}
                </p>
                {question.type === 'multiple-choice' ? (
                  <div className="mt-3 space-y-2">
                    {question.options?.map((option) => (
                      <label key={option.id} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          checked={answers[question.id] === option.id.toString()}
                          className="form-radio text-blue-600"
                        />
                        <span className="text-gray-700">{option.optionText}</span>
                      </label>
                    ))}
                  </div>
                ) : question.type === 'true-false' ? (
                  <div className="mt-3 space-y-2">
                    {['True', 'False'].map((option) => (
                      <label key={option} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          checked={answers[question.id] === option}
                          className="form-radio text-blue-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-3 w-full p-2 border border-gray-300 rounded"
                    rows={3}
                    placeholder="Enter your answer here..."
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => navigate(`/app/trainings/${trainingId}`)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={loading || Object.keys(answers).length === 0}
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;