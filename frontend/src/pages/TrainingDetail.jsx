import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { getTrainingById } from '../services/api';
import Certificate from '../components/Certificate';

const TrainingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [success, setSuccess] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setError(null);
      setSuccess('');
      
      const response = await api.post(`/trainings/${id}/enroll`);
      setSuccess('Successfully enrolled in the training!');
      // Refresh training data to update enrollment status
      const updatedTraining = await getTrainingById(id);
      setTraining(updatedTraining);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in training');
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        setLoading(true);
        const data = await getTrainingById(id);
        setTraining(data);
      } catch (err) {
        setError('Failed to load training details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTraining();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="mt-2">{error}</p>
        <button 
          onClick={() => navigate('/app/trainings')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Trainings
        </button>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Training not found</h2>
        <button 
          onClick={() => navigate('/app/trainings')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Trainings
        </button>
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
          <h1 className="text-3xl font-bold text-gray-800">{training.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            training.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
            training.status === 'In-Progress' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {training.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Training Information</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Description:</span> {training.description}</p>
              <p><span className="font-medium">Category:</span> {training.category}</p>
              <p><span className="font-medium">Start Date:</span> {new Date(training.startDate).toLocaleDateString()}</p>
              <p><span className="font-medium">End Date:</span> {new Date(training.endDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Trainer:</span> {training.trainerName}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button 
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => navigate(`/app/trainings/${id}/materials`)}
              >
                View Materials
              </button>
              
              {user.role === 'Employee' && !training.isEnrolled && (
                <button 
                  className={`w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
                    enrolling ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Training'}
                </button>
              )}

              {user.role === 'Employee' && training.isEnrolled && (
                <>
                  <button 
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => navigate(`/app/trainings/${id}/feedback`)}
                  >
                    Provide Feedback
                  </button>
                  
                  {training.completionStatus !== 'Completed' && (
                    <button 
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                      onClick={() => navigate(`/app/trainings/${id}/quizzes`)}
                    >
                      Take Quiz
                    </button>
                  )}

                  <button 
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setShowCertificate(true)}
                  >
                    View Certificate
                  </button>
                </>
              )}
              
              {user.role === 'Trainer' && (
                <>
                  <button 
                    className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => navigate(`/app/trainings/${id}/manage`)}
                  >
                    Manage Training
                  </button>
                  <button 
                    className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    onClick={() => navigate(`/app/trainings/${id}/quiz-manager`)}
                  >
                    Manage Quizzes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Certificate Modal */}
      {showCertificate && (
        <Certificate
          trainingData={{
            ...training,
            user: {
              name: user.name || user.username
            }
          }}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default TrainingDetail;