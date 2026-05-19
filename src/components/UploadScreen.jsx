import { useRef, useState, useCallback } from 'react';
import { Upload, Loader, AlertCircle, Plus, FileText, X, Play } from 'lucide-react';
import Papa from 'papaparse';

export default function UploadScreen({ onData }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);

  const handleAddFiles = useCallback((newFilesList) => {
    if (!newFilesList || newFilesList.length === 0) return;
    
    // Filter out non-csv files
    const newFiles = Array.from(newFilesList).filter(f => f.name.endsWith('.csv'));
    
    if (newFiles.length === 0) {
      setError('Please upload valid .csv files.');
      return;
    }
    
    setError(null);

    setFiles(prev => {
      // Prevent adding the exact same file twice based on name and size
      const existingIds = new Set(prev.map(p => `${p.name}-${p.size}`));
      const uniqueNewFiles = newFiles.filter(f => !existingIds.has(`${f.name}-${f.size}`));
      return [...prev, ...uniqueNewFiles];
    });
  }, []);

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const processAllFiles = useCallback(async () => {
    if (files.length === 0) return;
    
    setParsing(true);
    setError(null);

    try {
      const allParsedData = [];

      // Create a promise for parsing each file
      const parseFile = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.onload = (e) => {
          try {
            const text = e.target.result;
            const lines = text.split('\n');
            
            // Find the actual header row to dynamically skip metadata
            const headerIndex = lines.findIndex(line => line.startsWith('TIMESTAMP'));
            
            if (headerIndex === -1) {
               reject(new Error(`Invalid format in ${file.name}: Could not find 'TIMESTAMP' header.`));
               return;
            }

            const dataSection = lines.slice(headerIndex).join('\n');

            Papa.parse(dataSection, {
              header: true,
              skipEmptyLines: true,
              transform: (v) => (typeof v === 'string' ? v.trim() : v),
              complete: (results) => resolve(results.data),
              error: (err) => reject(new Error(`Error parsing ${file.name}: ${err.message}`)),
            });
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsText(file);
      });

      // Parse all selected files concurrently
      const results = await Promise.all(files.map(parseFile));
      
      // Flatten arrays into a single dataset
      for (const result of results) {
        allParsedData.push(...result);
      }

      setParsing(false);
      onData(allParsedData);

    } catch (err) {
      setParsing(false);
      setError(err.message);
    }
  }, [files, onData]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (!parsing) {
      handleAddFiles(e.dataTransfer.files);
    }
  }, [parsing, handleAddFiles]);

  // Handle file input change and reset input value to allow re-selecting the same file if deleted
  const handleInputChange = (e) => {
    handleAddFiles(e.target.files);
    e.target.value = null; 
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          DSR Log Analyzer
        </h1>
      </div>

      {files.length === 0 ? (
        // Empty State: Big Dropzone
        <div
          className={`drop-zone w-full max-w-md p-10 flex flex-col items-center gap-4 cursor-pointer ${dragging ? 'dragging' : ''}`}
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
            multiple // Added multiple attribute
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
          }}>
            <Upload size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Drop your CSV files here
            </div>
            <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
              Supports multiple files
            </div>
          </div>
        </div>
      ) : (
        // File List State
        <div className="w-full max-w-md p-5 flex flex-col gap-4 shadow-sm" style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border)',
          borderRadius: '8px'
        }}>
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Staged Files ({files.length})
            </h3>
            <button 
              onClick={() => inputRef.current.click()} 
              disabled={parsing}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
              style={{ color: 'var(--accent)', background: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <Plus size={12} /> Add more
            </button>
          </div>
          
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />

          <div className="flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: '240px' }}>
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded text-xs" style={{ border: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                  <span className="truncate" title={file.name} style={{ color: 'var(--text-primary)' }}>
                    {file.name}
                  </span>
                  <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                {!parsing && (
                  <button 
                    onClick={() => removeFile(i)} 
                    className="p-1 rounded hover:bg-red-50 flex-shrink-0"
                    style={{ color: 'var(--severity-critical)' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            {parsing ? (
              <div className="flex flex-col items-center justify-center gap-2 p-3 text-sm" style={{ color: 'var(--accent)', background: 'var(--bg-base)', borderRadius: '4px' }}>
                <Loader size={20} className="animate-spin" />
                <span>Aggregating & Parsing Data...</span>
              </div>
            ) : (
              <button 
                onClick={processAllFiles} 
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
              >
                <Play size={14} /> 
                Process {files.length} File{files.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-xs px-4 py-3 rounded w-full max-w-md shadow-sm" style={{
          color: 'var(--severity-critical)',
          background: '#fef2f2',
          border: '1px solid #fecaca',
        }}>
          <AlertCircle size={14} className="flex-shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}
    </div>
  );
}