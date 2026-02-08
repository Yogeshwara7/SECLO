import React from "react";
import UploadForm from "../components/UploadForm";

const Upload = () => {
    return (
        <div style={{ 
            padding: '40px', 
            backgroundColor: '#FAF3E1',
            minHeight: 'calc(100vh - 80px)'
        }}>
            <h3 style={{ 
                fontSize: '28px', 
                color: '#222222', 
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                Upload Payroll CSV
            </h3>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center' 
            }}>
                <UploadForm />
            </div>
        </div>
    );
};

export default Upload;