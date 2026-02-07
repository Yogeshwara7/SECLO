import React, { useState } from "react";
import { api } from "../services/api";

const UploadForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [batchId, setBatchId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isStartingWorkflow, setIsStartingWorkflow] = useState(false);

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/payroll/upload", formData);
            setBatchId(res.data.batchId);
            setMessage(`Uploaded! Batch ID: ${res.data.batchId}`);
        } catch (err) {
            setMessage("Upload failed");
            setBatchId(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleStartWorkflow = async () => {
        if (!batchId) return;

        setIsStartingWorkflow(true);
        try {
            const res = await api.post("/payroll/start", { batchId });
            setMessage(`Workflow started! Status: ${res.data.status || 'Processing'}`);
        } catch (err) {
            setMessage("Failed to start workflow");
        } finally {
            setIsStartingWorkflow(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px' }}>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ marginBottom: '10px', display: 'block' }}
                />
                
                <button 
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: !file || isUploading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !file || isUploading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isUploading ? 'Uploading...' : 'Upload Payroll'}
                </button>
            </div>

            {batchId && (
                <div style={{ marginBottom: '20px' }}>
                    <button 
                        onClick={handleStartWorkflow}
                        disabled={isStartingWorkflow}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isStartingWorkflow ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isStartingWorkflow ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isStartingWorkflow ? 'Starting...' : 'Start Workflow'}
                    </button>
                </div>
            )}

            {message && (
                <p style={{ 
                    padding: '10px', 
                    backgroundColor: message.includes('failed') ? '#f8d7da' : '#d4edda',
                    color: message.includes('failed') ? '#721c24' : '#155724',
                    border: `1px solid ${message.includes('failed') ? '#f5c6cb' : '#c3e6cb'}`,
                    borderRadius: '4px'
                }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default UploadForm;