import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TrainingList from './pages/TrainingList';
import TrainingDetail from './pages/TrainingDetail';
import Quiz from './pages/Quiz';
import Certificate from './pages/Certificate';
import Materials from './pages/Materials';
import Attendance from './pages/Attendance';
import CreateTraining from './pages/CreateTraining';
import Feedback from './pages/Feedback';
import QuizManager from './pages/QuizManager';
import TakeQuiz from './pages/TakeQuiz';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/app" element={<Layout />}>
        <Route index element={<Navigate to="/app/dashboard" />} />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="trainings" 
          element={
            <ProtectedRoute>
              <TrainingList />
            </ProtectedRoute>
          } 
        />
        <Route
          path="trainings/create"
          element={
            <ProtectedRoute allowedRoles={['Trainer', 'trainer']}>
              <CreateTraining />
            </ProtectedRoute>
          }
        />
        <Route
          path="trainings/:id"
          element={
            <ProtectedRoute>
              <TrainingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="trainings/:trainingId/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="trainings/:trainingId/certificate"
          element={
            <ProtectedRoute>
              <Certificate />
            </ProtectedRoute>
          }
        />
        <Route 
          path="trainings/:id/materials" 
          element={
            <ProtectedRoute>
              <Materials />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="trainings/attendance" 
          element={
            <ProtectedRoute allowedRoles={['Trainer', 'trainer']}>
              <Attendance />
            </ProtectedRoute>
          } 
        />
        <Route
          path="trainings/:trainingId/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="trainings/:trainingId/quiz-manager"
          element={
            <ProtectedRoute allowedRoles={['Trainer', 'trainer']}>
              <QuizManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="trainings/:trainingId/quizzes"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="quizzes/:quizId/take"
          element={
            <ProtectedRoute>
              <TakeQuiz />
            </ProtectedRoute>
          }
        />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/app/dashboard" />} />
    </Routes>
  );
}

export default App;