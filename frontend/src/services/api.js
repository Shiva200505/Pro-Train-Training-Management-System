import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000,
  withCredentials: true
});

// Add request interceptor to set token before each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch (e) {
        console.error('Error during logout redirect:', e);
      }
    }
    
    // Network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  return response.data;
};

// Training API functions
export const getTrainings = async () => {
  try {
    const response = await api.get('/trainings');
    return response.data;
  } catch (error) {
    console.error('Error fetching trainings:', error);
    throw error;
  }
};

export const getTrainingById = async (id) => {
  try {
    if (!id) throw new Error('Training ID is required');
    const response = await api.get(`/trainings/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.data) {
      throw new Error('Training not found');
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching training ${id}:`, error);
    if (error.response?.status === 404) {
      throw new Error('Training not found');
    } else if (error.response?.status === 401) {
      throw new Error('Please login to view training details');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch training details');
    }
  }
};

export const getEmployeeTrainings = async () => {
  try {
    const response = await api.get('/employee/trainings');
    return response.data;
  } catch (error) {
    console.error('Error fetching employee trainings:', error);
    throw error;
  }
};

// Training Materials API functions
export const getTrainingMaterials = async (trainingId) => {
  try {
    const response = await api.get(`/trainings/${trainingId}/materials`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training materials:', error);
    throw error;
  }
};

export const uploadMaterial = async (trainingId, file) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Override the default content type to allow form data
    const headers = {
      'Content-Type': 'multipart/form-data'
    };

    const response = await api.post(`/trainings/materials?trainingId=${trainingId}`, formData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error uploading material:', error);
    throw error;
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    const response = await api.delete(`/trainings/materials/${materialId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

// Quiz API functions
// Attendance API functions
export const getAttendance = async (trainingId) => {
  try {
    const response = await api.get(`/trainings/${trainingId}/attendance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    if (error.response?.status === 404) {
      throw new Error('Training not found');
    } else if (error.response?.status === 401) {
      throw new Error('Please login to view attendance');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance records');
    }
  }
};

export const markAttendance = async (trainingId, userId, present) => {
  try {
    const response = await api.post(`/trainings/${trainingId}/attendance`, {
      userId,
      present
    });
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid attendance data');
    } else if (error.response?.status === 401) {
      throw new Error('Please login to mark attendance');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to mark attendance');
    }
  }
};

export const getAttendanceSummary = async (trainingId) => {
  try {
    const response = await api.get(`/trainings/${trainingId}/attendance/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    throw error;
  }
};

export const getQuizzes = async (trainingId) => {
  try {
    const response = await api.get(`/quizzes/training/${trainingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

export const createQuiz = async (quizData) => {
  try {
    // Convert duration to timeLimit for backend compatibility
    const { duration, ...rest } = quizData;
    const formattedData = {
      ...rest,
      timeLimit: duration
    };
    const response = await api.post('/quizzes/create', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

export const startQuiz = async (quizId) => {
  try {
    // Get the quiz details first
    const quizResponse = await api.get(`/quizzes/${quizId}`);
    
    // Then start the quiz attempt
    const response = await api.post(`/quizzes/${quizId}/start`);
    
    // Return both quiz data and attempt info
    return {
      ...response.data,
      quiz: quizResponse.data
    };
  } catch (error) {
    console.error('Error starting quiz:', error);
    throw error;
  }
};

export const submitQuizResponse = async (responseData) => {
  try {
    const response = await api.post('/quizzes/response', responseData);
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz response:', error);
    throw error;
  }
};

export const completeQuiz = async (attemptId) => {
  try {
    const response = await api.post(`/quizzes/attempt/${attemptId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error completing quiz:', error);
    throw error;
  }
};

export const getQuizResults = async (quizId) => {
  try {
    const response = await api.get(`/quizzes/${quizId}/results`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    throw error;
  }
};

export const addQuestion = async (quizId, questionData) => {
  try {
    const response = await api.post(`/quizzes/${quizId}/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
};

export const updateQuestion = async (quizId, questionId, questionData) => {
  try {
    const response = await api.put(`/quizzes/${quizId}/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

export const deleteQuestion = async (quizId, questionId) => {
  try {
    const response = await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Feedback API functions
export const submitFeedback = async (trainingId, data) => {
  try {
    const response = await api.post(`/trainings/${trainingId}/feedback`, data);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const getTrainingFeedback = async (trainingId) => {
  try {
    const response = await api.get(`/trainings/${trainingId}/feedback`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training feedback:', error);
    throw error;
  }
};

export const deleteFeedback = async (feedbackId) => {
  try {
    const response = await api.delete(`/trainings/feedback/${feedbackId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

export default api;