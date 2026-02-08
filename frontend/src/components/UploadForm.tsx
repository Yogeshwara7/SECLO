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
        <div style={{ 
            padding: '30px', 
            maxWidth: '500px',
            backgroundColor: '#F5E7C6',
            borderRadius: '12px',
            border: '2px solid #FA8112'
        }}>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ 
                        marginBottom: '15px', 
                        display: 'block',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '2px solid #222222',
                        backgroundColor: '#FAF3E1',
                        color: '#222222',
                        width: '100%'
                    }}
                />
                
                <button 
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: !file || isUploading ? '#F5E7C6' : '#FA8112',
                        color: !file || isUploading ? '#222222' : '#FAF3E1',
                        border: '2px solid #222222',
                        borderRadius: '8px',
                        cursor: !file || isUploading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        width: '100%',
                        transition: 'all 0.2s ease'
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
                            padding: '12px 24px',
                            backgroundColor: isStartingWorkflow ? '#F5E7C6' : '#222222',
                            color: isStartingWorkflow ? '#222222' : '#FAF3E1',
                            border: '2px solid #FA8112',
                            borderRadius: '8px',
                            cursor: isStartingWorkflow ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            width: '100%',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isStartingWorkflow ? 'Starting...' : 'Start Workflow'}
                    </button>
                </div>
            )}

            {message && (
                <p style={{ 
                    padding: '15px', 
                    backgroundColor: message.includes('failed') ? '#222222' : '#FA8112',
                    color: message.includes('failed') ? '#FAF3E1' : '#FAF3E1',
                    border: `2px solid ${message.includes('failed') ? '#FA8112' : '#222222'}`,
                    borderRadius: '8px',
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default UploadForm;