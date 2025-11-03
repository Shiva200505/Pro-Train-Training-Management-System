import { useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-4">
          We apologize for the inconvenience. An error has occurred while loading this page.
        </p>
        {error && (
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-700 font-mono">{error.message}</p>
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}