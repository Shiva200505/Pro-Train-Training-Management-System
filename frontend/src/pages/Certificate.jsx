import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrainingById } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Certificate = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const data = await getTrainingById(trainingId);
        setTraining(data);
      } catch (err) {
        setError('Failed to load training details');
      } finally {
        setLoading(false);
      }
    };

    fetchTraining();
  }, [trainingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600 mt-2">{error || 'Training not found'}</p>
          <button
            onClick={() => navigate('/app/trainings')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Trainings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 border-8 border-blue-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-6">Certificate of Completion</h1>
          
          <p className="text-xl text-gray-600 mb-8">This is to certify that</p>
          
          <p className="text-3xl font-bold text-gray-800 mb-8">{user.fullName}</p>
          
          <p className="text-xl text-gray-600 mb-4">has successfully completed the training</p>
          
          <p className="text-2xl font-bold text-blue-700 mb-8">{training.title}</p>
          
          <div className="mb-8">
            <p className="text-lg text-gray-600">conducted from</p>
            <p className="text-xl font-semibold text-gray-800">
              {new Date(training.startDate).toLocaleDateString()} to {new Date(training.endDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div>
              <div className="w-40 mx-auto border-t-2 border-gray-400 pt-2">
                <p className="font-semibold text-gray-800">{training.trainerName}</p>
                <p className="text-gray-600">Trainer</p>
              </div>
            </div>
            <div>
              <div className="w-40 mx-auto border-t-2 border-gray-400 pt-2">
                <p className="font-semibold text-gray-800">Pro-Train</p>
                <p className="text-gray-600">Organization</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="text-gray-500">Certificate ID: {training.id}-{user.id}-{Date.now()}</p>
            <p className="text-gray-500">Issued on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-4"
        >
          Download Certificate
        </button>
        <button
          onClick={() => navigate(`/app/trainings/${trainingId}`)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back to Training
        </button>
      </div>
    </div>
  );
};

export default Certificate;