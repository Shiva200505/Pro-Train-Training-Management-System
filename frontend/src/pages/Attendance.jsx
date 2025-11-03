import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Users, Check, X } from 'lucide-react';
import api from '../services/api';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch trainings on component mount
    const fetchTrainings = async () => {
      try {
        const response = await api.get('/trainings');
        // Filter trainings based on trainer ID if user is a trainer
        const filteredTrainings = user.role === 'Trainer' 
          ? response.data.filter(t => t.trainerId === user.id)
          : response.data;
        setTrainings(filteredTrainings);
      } catch (error) {
        console.error('Error fetching trainings:', error);
        setError('Failed to fetch trainings. Please try again.');
      }
    };

    fetchTrainings();
  }, [user]);

  useEffect(() => {
    // Fetch attendance records when a training is selected
    const fetchAttendance = async () => {
      if (!selectedTraining) return;
      
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        console.log('Fetching attendance for training:', selectedTraining);
        const response = await api.get(`/trainings/${selectedTraining}/attendance`);
        console.log('Attendance response:', response.data);
        
        setAttendanceRecords(response.data);
        if (response.data.length === 0) {
          setError('No students are currently enrolled in this training.');
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch attendance records';
        setError(`${errorMessage}. Please try again.`);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedTraining]);

  const markAttendance = async (userId, present) => {
    try {
      setLoading(true);
      setError('');
      await api.post(`/trainings/${selectedTraining}/attendance`, {
        userId,
        present
      });
      // Refresh attendance records
      const response = await api.get(`/trainings/${selectedTraining}/attendance`);
      setAttendanceRecords(response.data);
      setSuccess('Attendance marked successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance Tracking</h1>
        <p className="text-gray-600">Manage student attendance for your training sessions</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Training
          </label>
          <select
            value={selectedTraining}
            onChange={(e) => setSelectedTraining(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={loading}
          >
            <option value="">Select a training...</option>
            {trainings.map(training => (
              <option key={training.id} value={training.id}>
                {training.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : selectedTraining ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today's Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        record.attendanceStatus === 'Present'
                          ? 'bg-green-100 text-green-800' 
                          : record.attendanceStatus === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.attendanceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAttendance(record.userId, true)}
                          disabled={loading}
                          className={`p-2 rounded transition-colors ${
                            record.attendanceStatus === 'Present'
                              ? 'bg-green-100 text-green-600' 
                              : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                          }`}
                          title="Mark as present"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => markAttendance(record.userId, false)}
                          disabled={loading}
                          className={`p-2 rounded transition-colors ${
                            record.attendanceStatus === 'Absent'
                              ? 'bg-red-100 text-red-600' 
                              : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                          }`}
                          title="Mark as absent"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendanceRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {error || 'No students enrolled in this training.'}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select a training to view attendance records.
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;