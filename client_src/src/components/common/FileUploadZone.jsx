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
    <div className="space-y-2 font-sans">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-[#3AAFA9] bg-[#DEF2F1]'
            : selectedFile
            ? 'border-[#3AAFA9] bg-[#DEF2F1]/60'
            : 'border-[#B3E3DE] bg-[#DEF2F1]/30 hover:border-[#3AAFA9] hover:bg-[#DEF2F1]/60'
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
              <img src={previewUrl} alt="Preview" className="h-28 max-w-full rounded-xl object-contain border border-[#B3E3DE]" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#17252A] text-[#3AAFA9]">
                <File size={28} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#3AAFA9]" />
              <span className="font-mono text-xs font-bold text-[#17252A] truncate max-w-xs">{selectedFile.name}</span>
              <span className="text-[10px] font-mono text-[#2B7A78]">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button onClick={clearFile} className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer" title="Remove File">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/30">
              <UploadCloud size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#17252A]">{label}</p>
              <p className="text-[11px] text-[#2B7A78] mt-0.5">{sublabel}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default FileUploadZone;
