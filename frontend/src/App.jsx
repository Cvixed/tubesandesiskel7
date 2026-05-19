import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import HistoryTable from './components/HistoryTable';
import { fetchStatus, fetchHistory } from './services/api';

function App() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statusData = await fetchStatus();
        setStatus(statusData);
        
        const historyData = await fetchHistory();
        setHistory(historyData);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Gagal mengambil data dari database. Periksa koneksi internet Anda.');
      }
    };

    // Initial load
    loadData();

    // Polling every 15 seconds
    const intervalId = setInterval(loadData, 15000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toolbar: Hilang, tidak butuh mock toggle lagi */}

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-10">
          <StatusCard status={status} />
        </div>
        
        <div>
          <HistoryTable history={history} />
        </div>
      </main>
    </div>
  );
}

export default App;
