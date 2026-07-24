import React, { useState, useRef, useEffect } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Button } from '../ui/Controls.jsx';
import { ScanFace, UserPlus, Upload, ShieldCheck, X, Camera, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../../api/client.js';

export default function FaceRecognitionView() {
  const [mode, setMode] = useState('search'); // 'search' or 'dataset'
  const [pending, setPending] = useState(false);
  
  // Search state
  const [searchFile, setSearchFile] = useState(null);
  const [searchPreview, setSearchPreview] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState('');
  
  // Explain state
  const [explainingId, setExplainingId] = useState(null);
  const [explanations, setExplanations] = useState({});

  // Dataset state
  const [dataset, setDataset] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [datasetError, setDatasetError] = useState('');

  useEffect(() => {
    if (mode === 'dataset') {
      fetchDataset();
    }
  }, [mode]);

  async function fetchDataset() {
    setPending(true);
    setDatasetError('');
    try {
      const res = await api.getFaceDataset();
      if (res.ok) {
        setDataset(res.data.data || []);
      } else {
        setDatasetError(res.error || 'Failed to fetch dataset');
      }
    } catch (e) {
      setDatasetError(e.message);
    }
    setPending(false);
  }

  const handleSearchFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSearchFile(file);
      setSearchPreview(URL.createObjectURL(file));
      setSearchResults(null);
      setSearchError('');
      setExplanations({});
    }
  };

  const handleSearch = async () => {
    if (!searchFile) return;
    setPending(true);
    setSearchError('');
    
    const formData = new FormData();
    formData.append('file', searchFile);
    
    try {
      const res = await api.searchFace(formData);
      if (res.ok) {
        setSearchResults(res.data.matches || []);
      } else {
        setSearchError(res.error || 'Search failed');
      }
    } catch (e) {
      setSearchError(e.message);
    }
    setPending(false);
  };

  const handleDeleteRecord = async (personId) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    setPending(true);
    try {
      const res = await api.deleteFaceRecord(personId);
      if (res.ok) {
        await fetchDataset();
      } else {
        alert(res.error || 'Delete failed');
      }
    } catch (e) {
      alert(e.message);
    }
    setPending(false);
  };

  const handleExplain = async (match) => {
    setExplainingId(match.person_id);
    try {
      const res = await api.explainCandidate(match.person_id, {
        name: match.full_name,
        age: match.age,
        gender: match.gender,
        case: match.case_number,
        station: match.station,
        status: match.status,
        notes: match.notes,
        similarity: match.similarity
      });
      if (res.ok) {
        setExplanations(prev => ({...prev, [match.person_id]: res.data.explanation}));
      } else {
        alert(res.error || 'Failed to explain candidate');
      }
    } catch (e) {
      alert(e.message);
    }
    setExplainingId(null);
  };

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <ScanFace size={24} className="text-pramaan-primary" />
          Face Recognition
        </h1>
        <div className="flex gap-2">
          <Button 
            variant={mode === 'search' ? 'primary' : 'outline'} 
            onClick={() => setMode('search')}
          >
            Recognition
          </Button>
          <Button 
            variant={mode === 'dataset' ? 'primary' : 'outline'} 
            onClick={() => setMode('dataset')}
          >
            Manage Dataset
          </Button>
        </div>
      </div>

      {mode === 'search' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase text-pramaan-text-secondary">Unknown Subject Input</h2>
            
            <div className="mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-pramaan-border bg-pramaan-elevated p-6 text-center">
              {searchPreview ? (
                <div className="relative mb-4">
                  <img src={searchPreview} alt="Preview" className="h-48 w-48 rounded-lg object-cover shadow" />
                  <button onClick={() => {setSearchFile(null); setSearchPreview(null);}} className="absolute -right-2 -top-2 rounded-full bg-pramaan-critical p-1 text-white">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="mb-4 flex flex-col items-center text-pramaan-text-secondary">
                  <Camera size={48} className="mb-2 opacity-50" />
                  <p className="text-sm">Upload a photo to identify the subject</p>
                </div>
              )}
              
              {!searchPreview && (
                <label className="cursor-pointer rounded border border-pramaan-border bg-pramaan-surface px-4 py-2 text-sm transition-colors hover:bg-pramaan-primary/10 hover:text-pramaan-primary">
                  <Upload size={16} className="mr-2 inline" />
                  Select Image
                  <input type="file" className="hidden" accept="image/jpeg, image/png" onChange={handleSearchFileChange} />
                </label>
              )}
            </div>

            <Button onClick={handleSearch} disabled={!searchFile || pending} className="w-full">
              {pending ? <RefreshCw className="mr-2 inline animate-spin" size={16} /> : <ScanFace className="mr-2 inline" size={16} />}
              Analyze Face
            </Button>
            
            {searchError && (
              <div className="mt-4 rounded border border-pramaan-critical/30 bg-pramaan-critical/10 p-3 text-sm text-pramaan-critical">
                {searchError}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase text-pramaan-text-secondary">Analysis Results</h2>
            
            {!searchResults ? (
              <div className="flex h-48 items-center justify-center text-sm text-pramaan-text-secondary">
                Upload an image and run analysis to see matches.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-pramaan-border bg-pramaan-elevated p-8 text-center text-pramaan-text-secondary">
                <ShieldCheck size={48} className="mb-4 opacity-30" />
                <p>No reliable match found in the authorized dataset.</p>
                <p className="mt-1 text-xs">Subject is not recognized.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((match, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex gap-4 rounded-lg border border-pramaan-border bg-pramaan-elevated p-3">
                      <img src={match.image_path} alt={match.full_name} className="h-20 w-20 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-pramaan-text truncate">{match.full_name}</h3>
                          <span className={`font-mono text-sm font-bold ${match.similarity > 80 ? 'text-pramaan-success' : 'text-pramaan-warning'}`}>
                            {match.similarity.toFixed(1)}% Match
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-pramaan-text-secondary grid grid-cols-2 gap-1">
                          <div>ID: {match.person_id}</div>
                          <div>Case: {match.case_number || 'N/A'}</div>
                          <div>Station: {match.station || 'N/A'}</div>
                          <div>Status: {match.status || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    
                    {explanations[match.person_id] ? (
                      <div className="rounded bg-pramaan-primary/10 border border-pramaan-primary/30 p-3 text-sm text-pramaan-text flex items-start gap-2">
                        <Sparkles size={16} className="text-pramaan-primary mt-1 shrink-0" />
                        <div>{explanations[match.person_id]}</div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleExplain(match)}
                          disabled={explainingId === match.person_id}
                        >
                          {explainingId === match.person_id ? <RefreshCw className="mr-2 animate-spin inline" size={14} /> : <Sparkles className="mr-2 inline text-pramaan-primary" size={14} />}
                          AI Profile
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-pramaan-text-secondary">Authorized Police Dataset</h2>
            <Button onClick={() => setShowAddModal(true)} size="sm">
              <UserPlus size={16} className="mr-2" />
              Update Dataset
            </Button>
          </div>
          
          {datasetError && (
             <div className="mb-4 rounded border border-pramaan-critical/30 bg-pramaan-critical/10 p-3 text-sm text-pramaan-critical">
               {datasetError}
             </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pramaan-border text-pramaan-text-secondary">
                  <th className="pb-2 font-medium">Photo</th>
                  <th className="pb-2 font-medium">Subject</th>
                  <th className="pb-2 font-medium">Case/Station</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dataset.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-pramaan-text-secondary">
                      No records in the dataset.
                    </td>
                  </tr>
                ) : (
                  dataset.map(record => (
                    <tr key={record.person_id} className="border-b border-pramaan-border/50">
                      <td className="py-3">
                        <img src={record.image_path} alt="" className="h-10 w-10 rounded-full object-cover" />
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-pramaan-text">{record.full_name}</div>
                        <div className="text-xs text-pramaan-text-secondary">{record.person_id} • {record.gender} • {record.age}y</div>
                      </td>
                      <td className="py-3 text-pramaan-text-secondary">
                        <div className="text-pramaan-text">{record.case_number}</div>
                        <div className="text-xs">{record.station}</div>
                      </td>
                      <td className="py-3">
                        <span className="rounded bg-pramaan-elevated px-2 py-1 text-xs border border-pramaan-border">{record.status || 'Unknown'}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleDeleteRecord(record.person_id)} className="text-pramaan-critical hover:underline text-xs">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddRecordModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchDataset();
          }} 
        />
      )}
    </WorkPanel>
  );
}

function AddRecordModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    person_id: `PID-${Math.floor(Math.random()*10000)}`,
    full_name: '',
    age: '',
    gender: 'Male',
    case_number: '',
    station: '',
    status: 'Suspect',
    notes: ''
  });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('A face image is required.');
      return;
    }
    setPending(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('file', file);

    try {
      const res = await api.addFaceRecord(data);
      if (res.ok) {
        onSuccess();
      } else {
        setError(res.error || 'Failed to add record');
      }
    } catch (err) {
      setError(err.message);
    }
    setPending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-pramaan-border bg-pramaan-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-pramaan-border p-4">
          <h2 className="text-lg font-semibold text-pramaan-text">Update Face Dataset</h2>
          <button onClick={onClose} className="text-pramaan-text-secondary hover:text-pramaan-text"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {error && <div className="mb-4 rounded border border-pramaan-critical/30 bg-pramaan-critical/10 p-3 text-sm text-pramaan-critical">{error}</div>}
          
          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            <div>
              <div className="mb-2 text-sm font-medium text-pramaan-text-secondary">Face Image</div>
              <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-pramaan-border bg-pramaan-elevated overflow-hidden transition-colors hover:border-pramaan-primary">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-pramaan-text-secondary p-4 text-center">
                    <Camera size={32} className="mb-2 opacity-50" />
                    <span className="text-xs">Upload Clear Photo</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/jpeg, image/png" onChange={handleFileChange} />
              </label>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-pramaan-text-secondary">Person ID</span>
                <input required value={formData.person_id} onChange={e => setFormData({...formData, person_id: e.target.value})} className="w-full rounded border border-pramaan-border bg-pramaan-surface p-2 text-sm outline-none focus:border-pramaan-primary" />
              </label>
              
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-pramaan-text-secondary">Full Name</span>
                <input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full rounded border border-pramaan-border bg-pramaan-surface p-2 text-sm outline-none focus:border-pramaan-primary" />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-pramaan-text-secondary">Age</span>
                <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full rounded border border-pramaan-border bg-pramaan-surface p-2 text-sm outline-none focus:border-pramaan-primary" />
              </label>
              
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-pramaan-text-secondary">Gender</span>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full rounded border border-pramaan-border bg-pramaan-surface p-2 text-sm outline-none focus:border-pramaan-primary">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </label>
              
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-pramaan-text-secondary">Case Reference</span>
                <input value={formData.case_number} onChange={e => setFormData({...formData, case_number: e.target.value})} className="w-full rounded border border-pramaan-border bg-pramaan-surface p-2 text-sm outline-none focus:border-pramaan-primary" />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-pramaan-text-secondary">Police Station</span>
                <input value={formData.station} onChange={e => setFormData({...formData, station: e.target.value})} className="w-full rounded border border-pramaan-border bg-pramaan-surface p-2 text-sm outline-none focus:border-pramaan-primary" />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-pramaan-text-secondary">Notes</span>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full rounded border border-pramaan-border bg-pramaan-surface p-2 text-sm outline-none focus:border-pramaan-primary" />
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 border-t border-pramaan-border pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={pending}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? <RefreshCw className="mr-2 inline animate-spin" size={16} /> : null}
              Save Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
