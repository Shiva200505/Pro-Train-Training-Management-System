import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Upload, File, Trash2, Download } from 'lucide-react';
import { getTrainings, getTrainingMaterials, uploadMaterial, deleteMaterial } from '../services/api';
import api from '../services/api';

const Materials = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState('');
  const [trainings, setTrainings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setError('');
        const data = await getTrainings();
        setTrainings(data);
      } catch (error) {
        console.error('Error fetching trainings:', error);
        setError('Failed to fetch trainings');
      }
    };

    fetchTrainings();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!selectedTraining) return;

      try {
        setError('');
        const materials = await getTrainingMaterials(selectedTraining);
        setFiles(materials);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('Failed to fetch training materials');
      }
    };

    fetchMaterials();
  }, [selectedTraining]);

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (file.size > maxSize) {
      setError(`File ${file.name} is too large. Maximum size is 10MB`);
      return false;
    }
    if (!allowedTypes.includes(file.type)) {
      setError(`File ${file.name} has invalid type. Allowed types are PDF, DOC, DOCX, PPT, and PPTX`);
      return false;
    }
    return true;
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles.length || !selectedTraining) {
      setError('Please select a training and a file to upload');
      return;
    }

    const file = uploadedFiles[0];
    if (!validateFile(file)) {
      event.target.value = '';
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/trainings/${selectedTraining}/materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      setFiles(prevFiles => [...prevFiles, response.data]);
      setSuccess('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error.response?.data?.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await deleteMaterial(materialId);
      setFiles(prevFiles => prevFiles.filter(file => file.id !== materialId));
      setSuccess('Material deleted successfully');
    } catch (error) {
      console.error('Error deleting material:', error);
      setError('Failed to delete material. Please try again.');
    }
  };

  const handleDownload = async (file) => {
    try {
      setError('');
      setDownloading(true);
      
      const response = await api.get(
        `/trainings/${selectedTraining}/materials/${file.id}/download`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Training Materials</h1>
        <p className="text-gray-600">Upload and manage your training materials</p>
      </div>

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

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Training
          </label>
          <select
            value={selectedTraining}
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

        {selectedTraining && (
          <div className="space-y-6">
            {user?.role === 'Trainer' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer inline-flex flex-col items-center ${uploading ? 'opacity-50' : ''}`}
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Drag and drop your files here, or click to select files'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Maximum file size: 10MB
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Supported files: PDF, DOC, DOCX, PPT, PPTX
                  </span>
                </label>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Uploaded Materials</h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleDownload(file)}
                        className="flex items-center hover:bg-gray-100 p-2 rounded-lg"
                        disabled={downloading}
                      >
                        <File className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-800 text-left">{file.title}</p>
                          <p className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</p>
                        </div>
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center"
                        title="Download material"
                        disabled={downloading}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {downloading ? 'Downloading...' : 'Download'}
                      </button>
                      {user?.role === 'Trainer' && (
                        <button
                          onClick={() => handleDeleteMaterial(file.id)}
                          className="p-2 hover:bg-red-50 rounded flex items-center"
                          title="Delete material"
                          disabled={downloading}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No materials uploaded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;