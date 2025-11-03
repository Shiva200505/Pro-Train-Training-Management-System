import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import {
  getQuizzes,
  createQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion
} from '../services/api';

const QuizManager = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    duration: 30,
    passingScore: 70
  });
  
  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'multiple-choice',
    points: 1,
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ]
  });

  useEffect(() => {
    fetchQuizzes();
  }, [trainingId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getQuizzes(trainingId);
      setQuizzes(response);
    } catch (err) {
      setError('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await createQuiz({
        ...quizForm,
        trainingId: parseInt(trainingId)
      });
      
      const createdQuiz = {
        id: response.id,
        title: quizForm.title,
        description: quizForm.description,
        duration: response.timeLimit, // Use timeLimit from response
        passingScore: quizForm.passingScore,
        trainingId: parseInt(trainingId),
        questions: []
      };
      
      setQuizzes([...quizzes, createdQuiz]);
      setShowQuizForm(false);
      setQuizForm({
        title: '',
        description: '',
        duration: 30,
        passingScore: 70
      });
      setSuccess('Quiz created successfully');
    } catch (err) {
      setError('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Filter out empty options and ensure at least one correct answer
      const filteredOptions = questionForm.options.map(opt => ({
        optionText: opt.optionText.trim(),
        isCorrect: opt.isCorrect
      })).filter(opt => opt.optionText !== '');
      if (filteredOptions.length < 2) {
        throw new Error('At least two options are required');
      }
      if (!filteredOptions.some(opt => opt.isCorrect)) {
        throw new Error('At least one correct answer is required');
      }

      const newQuestion = await addQuestion(selectedQuiz.id, {
        ...questionForm,
        options: filteredOptions
      });
      
      // Update the quizzes state with the new question
      setQuizzes(quizzes.map(quiz => 
        quiz.id === selectedQuiz.id 
          ? { 
              ...quiz, 
              questions: [...(quiz.questions || []), newQuestion]
            }
          : quiz
      ));
      
      // Reset the form
      setShowQuestionForm(false);
      setQuestionForm({
        question: '',
        type: 'multiple-choice',
        points: 1,
        options: [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ]
      });
      setSuccess('Question added successfully');
    } catch (err) {
      setError(err.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionId, updatedData) => {
    try {
      setLoading(true);
      const updatedQuestion = await updateQuestion(selectedQuiz.id, questionId, updatedData);
      
      // Update the quizzes state with the updated question
      setQuizzes(quizzes.map(quiz => 
        quiz.id === selectedQuiz.id 
          ? {
              ...quiz,
              questions: quiz.questions.map(q => 
                q.id === questionId ? updatedQuestion : q
              )
            }
          : quiz
      ));
      
      setSuccess('Question updated successfully');
    } catch (err) {
      setError('Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteQuestion(selectedQuiz.id, questionId);
      
      // Remove the question from the quizzes state
      setQuizzes(quizzes.map(quiz => 
        quiz.id === selectedQuiz.id 
          ? {
              ...quiz,
              questions: quiz.questions.filter(q => q.id !== questionId)
            }
          : quiz
      ));
      
      setSuccess('Question deleted successfully');
    } catch (err) {
      setError('Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...questionForm.options];
    if (field === 'isCorrect' && value === true) {
      // For multiple choice, only one answer can be correct
      newOptions.forEach(opt => opt.isCorrect = false);
    }
    newOptions[index] = { ...newOptions[index], [field]: value };
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quiz Manager</h1>
          <button
            onClick={() => setShowQuizForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Quiz
          </button>
        </div>

        {showQuizForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded">
            <h2 className="text-xl font-semibold mb-4">Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowQuizForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedQuiz && showQuestionForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded">
            <h2 className="text-xl font-semibold mb-4">Add Question</h2>
            <form onSubmit={handleAddQuestion}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={questionForm.type}
                    onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="short-answer">Short Answer</option>
                  </select>
                </div>
                
                {questionForm.type === 'multiple-choice' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Options (at least 2 required)
                    </label>
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          placeholder={`Option ${index + 1}`}
                        />
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={option.isCorrect}
                            onChange={() => handleOptionChange(index, 'isCorrect', true)}
                            className="form-radio text-blue-600"
                          />
                          <span className="text-sm text-gray-600">Correct Answer</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6">
          {quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
                      <p className="text-gray-600 mt-1">{quiz.description}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        <p>Questions: {quiz.questions?.length || 0}</p>
                        <p>Duration: {quiz.duration} minutes</p>
                        <p>Passing Score: {quiz.passingScore}%</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setShowQuestionForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Add Question"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setQuestionForm({
                            question: question.question,
                            type: question.type,
                            points: question.points,
                            options: question.options
                          });
                          setShowQuestionForm(true);
                        }}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="Edit Question"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Question"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {quiz.questions && quiz.questions.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium text-gray-700">Questions:</h4>
                      {quiz.questions.map((question, index) => (
                        <div key={question.id} className="pl-4 border-l-2 border-gray-200">
                          <p className="text-gray-800">
                            {index + 1}. {question.question}
                          </p>
                          {question.type === 'multiple-choice' && (
                            <div className="mt-2 pl-4 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                  <span className={option.isCorrect ? 'text-green-600' : 'text-gray-600'}>
                                    {String.fromCharCode(65 + optIndex)}. {option.optionText}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No quizzes created yet. Click the "Create New Quiz" button to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizManager;