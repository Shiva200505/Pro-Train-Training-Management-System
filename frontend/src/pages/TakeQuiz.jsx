import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startQuiz, completeQuiz, submitQuizResponse } from '../services/api';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    initializeQuiz();
  }, [quizId]);

  useEffect(() => {
    let timer;
    if (timeLeft !== null && timeLeft > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizSubmission();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, quizCompleted]);

  const initializeQuiz = async () => {
    try {
      setLoading(true);
      const response = await startQuiz(quizId);
      console.log('Quiz Response:', response);
      if (!response.quiz || !response.quiz.questions || response.quiz.questions.length === 0) {
        throw new Error('Quiz has no questions');
      }
      setAttemptId(response.id);
      setQuiz(response.quiz);
      setTimeLeft(response.quiz?.timeLimit * 60 || 1800); // Convert minutes to seconds
    } catch (err) {
      setError(err.message || 'Failed to start quiz');
      console.error('Quiz initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleQuizSubmission = async () => {
    try {
      setLoading(true);
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
      setScore(result.score);
      setQuizCompleted(true);
    } catch (err) {
      setError('Failed to submit quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes + ':' + remainingSeconds.toString().padStart(2, '0');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Quiz Completed!</h2>
          <div className="text-center">
            <p className="text-xl mb-4">Your Score: {score}%</p>
            {score >= (quiz?.passingScore || 60) ? (
              <div className="text-green-600 mb-4">Congratulations! You passed the quiz!</div>
            ) : (
              <div className="text-red-600 mb-4">Unfortunately, you did not meet the passing score.</div>
            )}
            <button
              onClick={() => navigate('/trainings')}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Return to Trainings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{quiz?.title}</h2>
          <div className="text-lg font-semibold">
            Time Left: <span className="text-blue-600">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span>Question {currentQuestionIndex + 1} of {quiz?.questions?.length}</span>
            <span className="text-sm text-gray-600">Points: {currentQuestion?.points || 1}</span>
          </div>

          <div className="mb-6">
            <p className="text-lg mb-4">{currentQuestion?.question}</p>
            
            {currentQuestion?.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <label key={option.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name={'question-' + currentQuestion.id}
                      value={option.id}
                      checked={answers[currentQuestion.id] === option.id}
                      onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                      className="mr-3"
                    />
                    <span>{option.optionText}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion?.type === 'true-false' && (
              <div className="space-y-3">
                {['true', 'false'].map((value) => (
                  <label key={value} className="flex items-center p-3 border rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name={'question-' + currentQuestion.id}
                      value={value}
                      checked={answers[currentQuestion.id] === value}
                      onChange={() => handleAnswerSelect(currentQuestion.id, value)}
                      className="mr-3"
                    />
                    <span className="capitalize">{value}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion?.type === 'short-answer' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                className="w-full p-3 border rounded"
                rows={4}
                placeholder="Enter your answer here..."
              />
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>

          {currentQuestionIndex < quiz?.questions?.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleQuizSubmission}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Submit Quiz
            </button>
          )}
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {quiz?.questions?.map((_, index) => {
              const isCurrentQuestion = currentQuestionIndex === index;
              const hasAnswer = answers[quiz.questions[index].id];
              const className = isCurrentQuestion 
                ? 'w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white'
                : hasAnswer
                  ? 'w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-800'
                  : 'w-8 h-8 rounded-full flex items-center justify-center bg-gray-200';
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={className}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;