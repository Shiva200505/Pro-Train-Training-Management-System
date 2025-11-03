import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BarChart, PieChart, Calendar, Users, BookOpen, Award, Plus, Settings, FileText } from 'lucide-react';
import { DataAnnotation, DataAnnotationGroup, AnnotatedCard, ExportOptions, VerificationBadge } from '../components/DataAnnotation';

// Import mock data
import { mockTrainings as defaultMockTrainings, trainingCategories as defaultTrainingCategories, trainingProgress as defaultTrainingProgress } from '../data/mockTrainings';

// Use imported data with fallback values
const mockTrainings = defaultMockTrainings || [];
const trainingCategories = defaultTrainingCategories || [];
const trainingProgress = defaultTrainingProgress || [];

// Admin Dashboard Component
const AdminDashboard = ({ stats = {}, trainings = [], loading }) => {
  // Ensure stats object has default values to prevent undefined errors
  stats = {
    totalTrainings: stats?.totalTrainings || 0,
    upcomingTrainings: stats?.upcomingTrainings || 0,
    completedTrainings: stats?.completedTrainings || 0,
    totalEmployees: stats?.totalEmployees || 0,
    ...stats
  };
  const StatCard = ({ icon: Icon, title, value, color, lastUpdated, trend }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center border border-gray-100 hover:shadow-md transition-all duration-200 relative">
      <div className={`rounded-full p-3 mr-4 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
      
      {/* Data annotation for last updated timestamp */}
      {lastUpdated && (
        <DataAnnotation
          type="time"
          label="Updated"
          value={new Date(lastUpdated).toLocaleDateString()}
          position="bottom-right"
          color="info"
        />
      )}
      
      {/* Data annotation for trend information */}
      {trend && (
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
          trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to the Pro-Train administration panel</p>
        </div>
        <ExportOptions 
          onExport={(format, includeAnnotations) => {
            console.log(`Exporting in ${format} format with annotations: ${includeAnnotations}`);
            // Implementation for export functionality
            alert(`Dashboard exported in ${format.toUpperCase()} format`);
          }}
          formats={['png', 'pdf', 'csv']}
          className="mb-4"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={BookOpen} 
          title="Total Trainings" 
          value={stats.totalTrainings} 
          color="bg-blue-500"
          lastUpdated={new Date().toISOString()}
          trend={12}
        />
        <StatCard 
          icon={Calendar} 
          title="Upcoming Trainings" 
          value={stats.upcomingTrainings} 
          color="bg-green-500"
          lastUpdated={new Date().toISOString()}
          trend={8}
        />
        <StatCard 
          icon={Award} 
          title="Completed Trainings"
          lastUpdated={new Date().toISOString()}
          trend={-5}
          value={stats.completedTrainings} 
          color="bg-purple-500" 
        />
        <StatCard 
          icon={Users} 
          title="Enrolled Users" 
          value={stats.enrolledUsers} 
          color="bg-orange-500" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">System Management</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/app/users" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="rounded-full bg-blue-100 p-3 mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">User Management</h3>
                  <p className="text-sm text-gray-500">Manage system users and permissions</p>
                </div>
              </Link>
              <Link to="/app/settings" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="rounded-full bg-purple-100 p-3 mr-3">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">System Settings</h3>
                  <p className="text-sm text-gray-500">Configure application settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">New training created</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Trainer Dashboard Component
const TrainerDashboard = ({ stats, trainings, loading }) => {
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className={`rounded-full p-3 mr-4 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Trainer Dashboard</h1>
        <p className="text-gray-600">Manage your training courses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={BookOpen} 
          title="My Trainings" 
          value={stats.totalTrainings} 
          color="bg-blue-500" 
        />
        <StatCard 
          icon={Calendar} 
          title="Upcoming Sessions" 
          value={stats.upcomingTrainings} 
          color="bg-green-500" 
        />
        <StatCard 
          icon={Award} 
          title="Completed Trainings" 
          value={stats.completedTrainings} 
          color="bg-purple-500" 
        />
        <StatCard 
          icon={Users} 
          title="Total Students" 
          value={stats.enrolledUsers} 
          color="bg-orange-500" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">My Trainings</h2>
              <Link to="/app/trainings/create" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                <Plus className="h-4 w-4 mr-1" />
                Create New Training
              </Link>
            </div>
            <div className="space-y-4">
              {trainings.slice(0, 3).map((training) => (
                <Link key={training.id} to={`/app/trainings/${training.id}`} className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">{training.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      training.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      training.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {training.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{training.description.substring(0, 100)}...</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
              <Link to="/app/trainings" className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-2">
                View All Trainings
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/app/trainings/create" 
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="rounded-full bg-blue-100 p-2 mr-3 group-hover:bg-blue-200">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 group-hover:text-blue-600">Create New Training</h3>
                <p className="text-xs text-gray-500">Add a new course to the system</p>
              </div>
            </Link>
            <Link to="/app/trainings" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="rounded-full bg-purple-100 p-2 mr-3">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Manage Materials</h3>
                <p className="text-xs text-gray-500">Upload and organize training materials</p>
              </div>
            </Link>
            <Link to="/app/trainings" state={{ showQuizManager: true }} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="rounded-full bg-yellow-100 p-2 mr-3">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Manage Quizzes</h3>
                <p className="text-xs text-gray-500">View and manage quizzes for your trainings</p>
              </div>
            </Link>
            <Link to="/app/trainings/attendance" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Track Attendance</h3>
                <p className="text-xs text-gray-500">Manage student attendance records</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee Dashboard Component
const EmployeeDashboard = ({ stats, trainings, loading }) => {
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className={`rounded-full p-3 mr-4 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Employee Dashboard</h1>
        <p className="text-gray-600">View and enroll in available training courses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={Award} 
          title="Enrolled Trainings" 
          value={trainings.filter(t => t.isEnrolled).length} 
          color="bg-blue-500" 
        />
        <StatCard 
          icon={Calendar} 
          title="Upcoming Sessions" 
          value={trainings.filter(t => !t.isEnrolled).length} 
          color="bg-green-500" 
        />
        <StatCard 
          icon={Award} 
          title="Completed Trainings" 
          value={trainings.filter(t => t.completionStatus === 'Completed').length} 
          color="bg-purple-500" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Available Trainings</h2>
              <Link to="/app/trainings" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {trainings.slice(0, 3).map((training) => (
                <Link key={training.id} to={`/app/trainings/${training.id}`} className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">{training.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      training.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      training.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {training.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{training.description.substring(0, 100)}...</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Progress</h2>
          <div className="space-y-4">
            {trainings
              .filter(t => t.isEnrolled)
              .slice(0, 3)
              .map(training => (
                <div key={training.id} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{training.title}</span>
                    <span className={`text-sm font-medium ${
                      training.completionStatus === 'Completed' ? 'text-green-700' : 
                      'text-blue-700'
                    }`}>
                      {training.completionStatus || 'In Progress'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        training.completionStatus === 'Completed' ? 'bg-green-600' : 'bg-blue-600'
                      }`} 
                      style={{ 
                        width: training.completionStatus === 'Completed' ? '100%' : '50%' 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            {trainings.filter(t => t.isEnrolled).length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No enrolled trainings yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalTrainings: 0,
    upcomingTrainings: 0,
    completedTrainings: 0,
    enrolledUsers: 0
  });
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (user?.role === 'Employee' || user?.role === 'employee') {
          // Fetch employee specific trainings
          const res = await api.get('/employee/trainings');
          const employeeTrainings = res.data;
          setTrainings(employeeTrainings);
          
          // Calculate employee specific stats
          const now = new Date();
          const upcoming = employeeTrainings.filter(t => new Date(t.startDate) > now);
          const enrolled = employeeTrainings.filter(t => t.isEnrolled);
          const completed = employeeTrainings.filter(t => t.completionStatus === 'Completed');
          
          setStats({
            totalTrainings: enrolled.length,
            upcomingTrainings: upcoming.length,
            completedTrainings: completed.length
          });
        } else {
          // Fetch all trainings for admin/trainer
          const res = await api.get('/trainings');
          const allTrainings = res.data;
          setTrainings(allTrainings);
          
          // Calculate stats
          const now = new Date();
          const upcoming = allTrainings.filter(t => new Date(t.startDate) > now);
          const inProgress = allTrainings.filter(t => t.status === 'In-Progress');
          const completed = allTrainings.filter(t => t.status === 'Completed');
          
          setStats({
            totalTrainings: allTrainings.length,
            upcomingTrainings: upcoming.length,
            completedTrainings: completed.length,
            enrolledUsers: allTrainings.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0)
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);
  
  // Render different dashboard based on user role
  if (user?.role === 'Admin' || user?.role === 'admin') {
    return <AdminDashboard stats={stats} trainings={trainings} loading={loading} />;
  } else if (user?.role === 'Trainer' || user?.role === 'trainer') {
    return <TrainerDashboard stats={stats} trainings={trainings} loading={loading} />;
  } else {
    return <EmployeeDashboard stats={stats} trainings={trainings} loading={loading} />;
  }
};

export default Dashboard;