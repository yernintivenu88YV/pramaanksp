import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';

export function FileUploadZone({
  onFileSelect,
  accept = 'image/*,.pdf,.doc,.docx',
  maxSizeMb = 10,
  label = 'Upload Evidence File or CCTV Frame',
  sublabel = 'Drag & drop image/document or browse files (Max 10MB)'
}) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    setError(null);
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMb}MB limit.`);
      return;
    }

    setSelectedFile(file);

    // Create preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        if (onFileSelect) {
          onFileSelect({
            file,
            base64: reader.result,
            name: file.name,
            size: file.size,
            type: file.type
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      if (onFileSelect) {
        onFileSelect({
          file,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-pramaan-primary bg-pramaan-primary/10'
            : selectedFile
            ? 'border-pramaan-success/50 bg-pramaan-success/5'
            : 'border-pramaan-border bg-pramaan-elevated/50 hover:border-pramaan-secondary/40 hover:bg-pramaan-elevated'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-28 max-w-full rounded-lg object-contain border border-pramaan-border" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-pramaan-primary/20 text-pramaan-primary">
                <File size={32} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-pramaan-success" />
              <span className="font-mono text-xs font-bold text-pramaan-text truncate max-w-xs">{selectedFile.name}</span>
              <span className="text-[10px] font-mono text-pramaan-text-secondary">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button onClick={clearFile} className="p-1 text-pramaan-critical hover:bg-pramaan-critical/20 rounded cursor-pointer" title="Remove File">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pramaan-primary/15 text-pramaan-primary">
              <UploadCloud size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-pramaan-text">{label}</p>
              <p className="text-[11px] text-pramaan-text-secondary mt-0.5">{sublabel}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-pramaan-critical">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default FileUploadZone;
