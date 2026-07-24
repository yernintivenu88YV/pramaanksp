import React, { useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Controls.jsx';
import { api } from '../../api/client.js';

export default function UploadDocumentsView() {
  const [file, setFile] = useState(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    setPending(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await api.ragUpload(formData);
    setPending(false);

    if (!res.ok) {
      setError(res.error || 'Failed to upload document');
      return;
    }

    setResult(res.data);
    setFile(null); // Reset after successful upload
  }

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2"><Upload size={20} /> Upload Investigation Documents</h1>
        <p className="text-sm text-pramaan-text-secondary">Ingest crime manuals, SOPs, and raw reports into the vector database.</p>
      </div>

      <div className="max-w-xl mx-auto mt-8">
        <form onSubmit={handleUpload} className="rounded-lg border-2 border-dashed border-pramaan-border p-8 text-center bg-pramaan-surface">
          <FileText size={48} className="mx-auto text-pramaan-text-secondary mb-4" />
          <p className="text-sm mb-4">Drag and drop your PDF or Text file here, or click to browse.</p>
          
          <input 
            type="file" 
            accept=".pdf,.txt,.md"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button type="button" className="pointer-events-none">Select File</Button>
          </label>

          {file && (
            <div className="mt-4 text-sm font-semibold text-pramaan-accent">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}

          <div className="mt-6 border-t border-pramaan-border/50 pt-4">
            <Button 
              type="submit" 
              disabled={!file || pending} 
              className="w-full justify-center"
            >
              {pending ? 'Uploading & Indexing...' : 'Upload & Vectorize'}
            </Button>
          </div>
        </form>

        {error && <div className="mt-4 rounded border border-pramaan-critical/30 bg-pramaan-critical/10 p-3 text-sm text-pramaan-critical">{error}</div>}

        {result && (
          <div className="mt-4 p-4 rounded bg-green-900/20 border border-green-800 flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-1">Document Successfully Indexed</h3>
              <p className="text-xs text-green-200/80">Document ID: {result.document_id}</p>
              <p className="text-xs text-green-200/80">Vector Chunks Generated: {result.chunks_processed}</p>
            </div>
          </div>
        )}
      </div>
    </WorkPanel>
  );
}
