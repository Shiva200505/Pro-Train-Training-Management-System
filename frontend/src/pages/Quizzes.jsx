import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Plus, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';

const QuizCard = ({ quiz, onStart }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm ${
        quiz.status === 'completed' ? 'bg-green-100 text-green-800' :
        quiz.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {quiz.status || 'Not Started'}
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-sm text-gray-600">Questions</p>
        <p className="text-lg font-semibold">{quiz.questionCount}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Duration</p>
        <p className="text-lg font-semibold">{quiz.duration} mins</p>
      </div>
    </div>
    
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <ClipboardList className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Passing Score: {quiz.passingScore}%</span>
      </div>
      <button
        onClick={() => onStart(quiz.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {quiz.status === 'completed' ? 'Review' : quiz.status === 'in-progress' ? 'Continue' : 'Start'}
      </button>
    </div>
  </div>
);

const CreateQuizForm = ({ trainingId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    passingScore: 70
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quizzes/create', { ...formData, trainingId });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
          <input
            type="number"
            value={formData.passingScore}
            onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            min={0}
            max={100}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Quiz
        </button>
      </div>
    </form>
  );
};

const Quizzes = () => {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);
  }, [user]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  
  useEffect(() => {
    const fetchAllTrainings = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching trainings...');
        const response = await api.get('/trainings');
        console.log('Trainings response:', response.data);
        setTrainings(response.data);
        if (response.data.length > 0) {
          console.log('Setting selected training:', response.data[0].id);
          setSelectedTraining(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching trainings:', error);
        setError('Failed to load trainings');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTrainings();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!selectedTraining) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/quizzes/training/${selectedTraining}`);
        setQuizzes(response.data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedTraining]);

  const handleStartQuiz = async (quizId) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/start`);
      // Navigate to quiz attempt page
      window.location.href = `/app/quizzes/${quizId}/attempt/${response.data.id}`;
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quizzes</h1>
          <p className="text-gray-600">Manage and take training quizzes</p>
        </div>
      </div>

      {/* Training Selection Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Training
        </label>
        <select
          value={selectedTraining || ''}
          onChange={(e) => setSelectedTraining(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">Select a training...</option>
          {trainings.map(training => (
            <option key={training.id} value={training.id}>
              {training.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end mb-6">
        {user?.role === 'Trainer' && selectedTraining && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Quiz
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Quiz</h2>
            <CreateQuizForm
              trainingId={selectedTraining}
              onClose={() => setShowCreateForm(false)}
              onSuccess={() => {
                const fetchQuizzes = async () => {
                  try {
                    const response = await api.get(`/quizzes/training/${selectedTraining}`);
                    setQuizzes(response.data);
                  } catch (error) {
                    console.error('Error fetching quizzes:', error);
                    setError('Failed to load quizzes');
                  }
                };
                fetchQuizzes();
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onStart={handleStartQuiz}
          />
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No quizzes available</h3>
          <p className="text-gray-500 mt-1">
            {user.role === 'Trainer' 
              ? 'Create your first quiz by clicking the button above'
              : 'No quizzes have been created for this training yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Quizzes;