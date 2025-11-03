import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, User, Tag, Search, Plus } from 'lucide-react';
import { DataAnnotation, DataAnnotationGroup, AnnotatedCard, ExportOptions, VerificationBadge } from '../components/DataAnnotation';

const TrainingList = () => {
  const { user } = useContext(AuthContext);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const res = await api.get('/trainings');
        setTrainings(res.data);
      } catch (error) {
        console.error('Error fetching trainings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const filteredTrainings = trainings
    .filter(training => {
      if (filter === 'all') return true;
      const normalizedStatus = training.status.toLowerCase().replace(' ', '-');
      return normalizedStatus === filter;
    })
    .filter(training => {
      const searchLower = searchTerm.toLowerCase();
      return training.title?.toLowerCase().includes(searchLower) ||
             training.description?.toLowerCase().includes(searchLower) ||
             training.category?.toLowerCase().includes(searchLower) ||
             training.trainerName?.toLowerCase().includes(searchLower);
    });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Trainings</h1>
        <div className="flex items-center gap-4">
          <ExportOptions 
            onExport={(format, includeAnnotations) => {
              console.log(`Exporting in ${format} format with annotations: ${includeAnnotations}`);
              alert(`Trainings exported in ${format.toUpperCase()} format`);
            }}
            formats={['csv', 'pdf']}
          />
          {(user?.role === 'admin' || user?.role === 'trainer') && (
            <Link 
              to="/app/trainings/new" 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Training
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search trainings..."
              className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:w-48 bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredTrainings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No trainings found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrainings.map(training => (
            <AnnotatedCard
                key={training.id}
                title=""
                annotations={[
                  {
                    type: "time",
                    label: "Last Updated",
                    value: new Date(training.updatedAt || Date.now()).toLocaleDateString(),
                    position: "top-right",
                    color: "info"
                  },
                  {
                    type: "tag",
                    label: "Status",
                    value: training.status || "Pending",
                    position: "bottom-right",
                    color: training.status === "Completed" ? "success" : 
                           training.status === "In Progress" ? "warning" : "primary"
                  }
                ]}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <Link to={`/app/trainings/${training.id}`} key={training.id} className="block">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800">{training.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    training.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    training.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                    training.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {training.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mt-2 line-clamp-2">{training.description}</p>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      {new Date(training.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      {new Date(training.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">{training.trainerName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Tag className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">{training.category}</span>
                  </div>
                </div>
              </Link>
            <VerificationBadge 
              verified={training.status === "Completed"}
              verifiedBy={training.completedBy || "System"}
              verifiedAt={training.completedAt || new Date().toISOString()}
              position="bottom-left"
              onVerify={(verificationData) => {
                console.log("Training verified:", verificationData);
                // Would typically call an API to update verification status
              }}
            />
            </AnnotatedCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingList;