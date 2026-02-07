import React from "react";
import UploadForm from "../components/UploadForm";
import exp from "constants";

const Upload = () =>{
    return(
        <div>
            <h3>Upload Payroll CSV</h3>
            <UploadForm/>
        </div>
    );
};

export default Upload;