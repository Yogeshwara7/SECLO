import React from "react";
import UploadForm from "../components/UploadForm";

const Upload = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h3>Upload Payroll CSV</h3>
            <UploadForm />
        </div>
    );
};

export default Upload;