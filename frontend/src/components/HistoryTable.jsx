import React from 'react';

const HistoryTable = ({ history, cuaca }) => {
  const isDark = cuaca?.toLowerCase() === 'hujan';

  if (!history || history.length === 0) {
    return (
      <div className={`rounded-2xl p-8 text-center mt-8 ${isDark ? 'glass-panel-dark text-white' : 'glass-panel text-gray-800'}`}>
        <svg className={`mx-auto h-12 w-12 mb-4 ${isDark ? 'text-white/30' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className={`font-medium ${isDark ? 'text-blue-200' : 'text-gray-500'}`}>Belum ada data riwayat cuaca.</p>
      </div>
    );
  }

  const getBadgeColor = (warna) => {
    if (isDark) {
      switch (warna?.toLowerCase()) {
        case 'hijau': return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'kuning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'merah': return 'bg-red-500/20 text-red-300 border-red-500/30';
        default: return 'bg-white/10 text-white border-white/20';
      }
    }
    switch (warna?.toLowerCase()) {
      case 'hijau': return 'bg-green-100 text-green-800 border-green-200';
      case 'kuning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'merah': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`mt-8 sm:mt-12 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl ${isDark ? 'glass-panel-dark text-white' : 'glass-panel text-gray-800'}`}>
      <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b flex justify-between items-center ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white/40'}`}>
        <h3 className="text-base sm:text-lg leading-6 font-bold">Riwayat Perubahan Cuaca</h3>
        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium 
          ${isDark ? 'bg-blue-500/20 text-blue-200' : 'bg-indigo-100 text-indigo-800'}`}>
          {history.length} data
        </span>
      </div>
      
      {/* Mobile card view */}
      <div className={`block sm:hidden divide-y ${isDark ? 'divide-white/10' : 'divide-gray-100'}`}>
        {history.map((item) => (
          <div key={item.id_riwayat} className="p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-xs truncate ${isDark ? 'text-blue-200' : 'text-gray-500'}`}>{item.waktu_kejadian}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeColor(item.kode_warna)}`}>
                  {item.nama_kondisi}
                </span>
                <span className={`text-xs font-mono ${isDark ? 'text-white/50' : 'text-gray-400'}`}>Sensor: {item.nilai_analog_sensor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className={`min-w-full divide-y ${isDark ? 'divide-white/10' : 'divide-gray-200'}`}>
          <thead className={isDark ? 'bg-white/5' : 'bg-gray-50/50'}>
            <tr>
              <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-blue-200' : 'text-gray-500'}`}>
                Tanggal & Waktu
              </th>
              <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-blue-200' : 'text-gray-500'}`}>
                Kondisi Cuaca
              </th>
              <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-blue-200' : 'text-gray-500'}`}>
                Nilai Sensor
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
            {history.map((item) => (
              <tr key={item.id_riwayat} className={`transition-colors duration-150 ${isDark ? 'hover:bg-white/10' : 'hover:bg-white/60'}`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  {item.waktu_kejadian}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(item.kode_warna)}`}>
                    {item.nama_kondisi}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
                  {item.nilai_analog_sensor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
