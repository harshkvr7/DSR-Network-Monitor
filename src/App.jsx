import { useState, useCallback } from 'react';
import UploadScreen from './components/UploadScreen';
import Dashboard from './components/Dashboard';

export default function App() {
  const [data, setData] = useState(null);

  const handleData = useCallback((rows) => {
    setData(rows);
  }, []);

  const handleReset = useCallback(() => {
    setData(null);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {data ? (
        <Dashboard rawData={data} onReset={handleReset} />
      ) : (
        <UploadScreen onData={handleData} />
      )}
    </div>
  );
}
