import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, StarHalf } from 'lucide-react';
import { getTrainingById, getTrainingFeedback, submitFeedback } from '../services/api';

import ErrorBoundary from '../components/ErrorBoundary';

const Feedback = () => {
    const { trainingId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [training, setTraining] = useState(null);
    const [feedbackData, setFeedbackData] = useState(null);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });

    useEffect(() => {
        fetchTrainingAndFeedback();
    }, [trainingId]);

    const fetchTrainingAndFeedback = async () => {
        try {
            setError('');
            const [trainingRes, feedbackRes] = await Promise.all([
                getTrainingById(trainingId),
                getTrainingFeedback(trainingId)
            ]);
            setTraining(trainingRes);
            setFeedbackData(feedbackRes);
            if (feedbackRes.userFeedback) {
                setFormData({
                    rating: feedbackRes.userFeedback.rating,
                    comment: feedbackRes.userFeedback.comment || ''
                });
            }
        } catch (error) {
            setError('Failed to load training details and feedback');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await submitFeedback(trainingId, formData);
            setSuccess('Feedback submitted successfully');
            fetchTrainingAndFeedback(); // Refresh feedback data
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Training Feedback
                </h1>
                <p className="text-gray-600">
                    Provide your feedback for {training?.title}
                </p>
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                        </label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => handleRatingClick(rating)}
                                    className={`p-2 rounded-full transition-colors ${
                                        formData.rating >= rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                >
                                    <Star className="h-8 w-8" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comments
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) =>
                                setFormData(prev => ({ ...prev, comment: e.target.value }))
                            }
                            rows={4}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Share your experience with this training..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/app/trainings/${trainingId}`)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>

                {feedbackData?.stats && (
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Training Rating Summary
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="w-24">Average:</div>
                                <div className="flex items-center">
                                    <span className="text-yellow-400 mr-1">
                                        {Number(feedbackData.stats.averageRating || 0).toFixed(1)}
                                    </span>
                                    <Star className="h-5 w-5 text-yellow-400" />
                                </div>
                            </div>
                            {[5, 4, 3, 2, 1].map((stars) => (
                                <div key={stars} className="flex items-center">
                                    <div className="w-24">{stars} stars:</div>
                                    <div className="flex-1">
                                        <div className="h-2 bg-gray-200 rounded">
                                            <div
                                                className="h-2 bg-yellow-400 rounded"
                                                style={{
                                                    width: `${
                                                        (feedbackData.stats[`${stars}Stars`] /
                                                            feedbackData.stats.totalFeedback) *
                                                        100
                                                    }%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-16 text-right text-sm text-gray-600">
                                        {feedbackData.stats[`${stars}Stars`]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {feedbackData?.feedback?.length > 0 && (
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Recent Feedback
                        </h3>
                        <div className="space-y-4">
                            {feedbackData.feedback.map((item) => (
                                <div key={item.id} className="border-b pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex text-yellow-400">
                                                {[...Array(item.rating)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4" />
                                                ))}
                                            </div>
                                            <span className="ml-2 text-sm text-gray-600">
                                                by {item.userName}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {item.comment && (
                                        <p className="mt-2 text-gray-700">{item.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

Feedback.ErrorBoundary = ErrorBoundary;

export default Feedback;