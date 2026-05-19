import { useRef, useState, useCallback } from 'react';

import { Upload, Loader, AlertCircle } from 'lucide-react';

import Papa from 'papaparse';



export default function UploadScreen({ onData }) {

  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);

  const [parsing, setParsing] = useState(false);

  const [error, setError] = useState(null);



  const processFile = useCallback((file) => {

    if (!file || !file.name.endsWith('.csv')) {

      setError('Please upload a valid .csv file.');

      return;

    }

    setError(null);

    setParsing(true);



    const reader = new FileReader();

    reader.onerror = () => { setParsing(false); setError('Failed to read file.'); };

    reader.onload = (e) => {

      setTimeout(() => {

        try {

          const lines = e.target.result.split('\n');

          const dataSection = lines.slice(9).join('\n');

          Papa.parse(dataSection, {

            header: true,

            skipEmptyLines: true,

            transform: (v) => (typeof v === 'string' ? v.trim() : v),

            complete: (results) => { setParsing(false); onData(results.data); },

            error: (err) => { setParsing(false); setError(err.message); },

          });

        } catch (err) {

          setParsing(false);

          setError(err.message);

        }

      }, 20);

    };

    reader.readAsText(file);

  }, [onData]);



  const handleDrop = useCallback((e) => {

    e.preventDefault();

    setDragging(false);

    processFile(e.dataTransfer.files[0]);

  }, [processFile]);



  return (

    <div className="h-full flex flex-col items-center justify-center p-8">

      <div className="mb-10 text-center">

        <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>

          DSR Log Analyzer

        </h1>

      </div>



      <div

        className={`drop-zone w-full max-w-md p-10 flex flex-col items-center gap-4 ${!parsing ? 'cursor-pointer' : ''} ${dragging ? 'dragging' : ''}`}

        style={{ background: 'var(--bg-surface)' }}

        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}

        onDragLeave={() => setDragging(false)}

        onDrop={handleDrop}

        onClick={() => !parsing && inputRef.current.click()}

      >

        <input

          ref={inputRef}

          type="file"

          accept=".csv"

          className="hidden"

          onChange={(e) => processFile(e.target.files[0])}

        />



        {parsing ? (

          <>

            <Loader size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />

            <div className="text-center">

              <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Parsing file…</div>

              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Processing log events, please wait</div>

            </div>

          </>

        ) : (

          <>

            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{

              background: '#eff6ff',

              border: '1px solid #bfdbfe',

            }}>

              <Upload size={20} style={{ color: 'var(--accent)' }} />

            </div>

            <div className="text-center">

              <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>

                Drop your CSV file here

              </div>

            </div>

          </>

        )}

      </div>



      {error && (

        <div className="mt-4 flex items-center gap-2 text-xs px-4 py-2 rounded" style={{

          color: 'var(--severity-critical)',

          background: '#fef2f2',

          border: '1px solid #fecaca',

        }}>

          <AlertCircle size={13} />

          {error}

        </div>

      )}

    </div>

  );

}