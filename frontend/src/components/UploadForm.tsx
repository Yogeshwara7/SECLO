import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';
import './UploadForm.css';

interface UploadFormProps {
  onUploadStart?: () => void;
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ 
  onUploadStart, 
  onUploadSuccess, 
  onUploadError 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { address, isConnected } = useAccount();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        onUploadError?.('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        onUploadError?.('Please upload a CSV file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      onUploadError?.('Please connect your wallet first');
      return;
    }
    
    if (!file) {
      onUploadError?.('Please select a file');
      return;
    }

    setUploading(true);
    onUploadStart?.();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('walletAddress', address);

    try {
      const response = await axios.post('http://localhost:3001/payroll/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadSuccess?.(response.data);
      setFile(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const isButtonDisabled = !file || uploading || !isConnected;

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      {!isConnected && (
        <div className="wallet-warning">
          <span className="warning-icon">[!]</span>
          <span className="warning-text">CONNECT WALLET TO EXECUTE WORKFLOW</span>
        </div>
      )}
      
      <div 
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleFileChange}
          className="file-input"
        />
        
        {!file ? (
          <label htmlFor="file-upload" className="upload-label">
            <div className="upload-icon">[+]</div>
            <div className="upload-text">
              <span className="upload-primary">DROP CSV FILE HERE</span>
              <span className="upload-secondary">or click to browse</span>
            </div>
          </label>
        ) : (
          <div className="file-selected">
            <div className="file-icon">[FILE]</div>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
            <button 
              type="button" 
              onClick={() => setFile(null)}
              className="file-remove"
            >
              [X]
            </button>
          </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isButtonDisabled}
        className="upload-button"
        title={!isConnected ? 'Connect wallet to enable' : ''}
      >
        {uploading ? (
          <>
            <span className="button-spinner">[-]</span>
            PROCESSING...
          </>
        ) : (
          <>
            <span className="button-icon">[&gt;]</span>
            EXECUTE WORKFLOW
            {!isConnected && <span className="button-lock"> [LOCKED]</span>}
          </>
        )}
      </button>

      <div className="upload-info">
        <div className="info-item">
          <span className="info-label">FORMAT:</span>
          <span className="info-value">wallet,amount,currency</span>
        </div>
        <div className="info-item">
          <span className="info-label">EXAMPLE:</span>
          <span className="info-value">0xABC...,5000,SCLO</span>
        </div>
      </div>
    </form>
  );
};

export default UploadForm;
