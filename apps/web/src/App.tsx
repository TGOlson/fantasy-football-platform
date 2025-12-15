import { useState, useEffect } from 'react'

interface HealthResponse {
  status: string;
  timestamp: string;
}

function App() {
  const [apiStatus, setApiStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/health`);
        const data = await response.json();
        setApiStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to API');
      } finally {
        setLoading(false);
      }
    };

    checkApi();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Fantasy Platform
          </h1>
          <p className="text-gray-600">
            Monorepo setup complete!
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>

          {loading && (
            <p className="text-gray-600">Connecting to API...</p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {apiStatus && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">✓ API Connected</p>
              <p className="text-sm mt-1">Status: {apiStatus.status}</p>
              <p className="text-sm">Time: {new Date(apiStatus.timestamp).toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Frontend running on http://localhost:5173</li>
            <li>✓ API running on http://localhost:3000</li>
            <li>✓ Communication working</li>
            <li className="pt-2 font-semibold text-gray-900">
              → Ready for Milestone 2: Database Setup
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
