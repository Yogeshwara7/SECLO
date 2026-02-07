import React, {useState} from "react";
import {api} from "../services/api";


const UploadForm=()=>{
    const [file,setFile]=useState<File | null>(null);
    const [message, setMessage]=useState("");

    const handleIpload= async()=>{
        if(!file) return;
    

        const formData=new FormData();
        formData.append("file",file);

        try{
            const res = await api.post("/payroll/upload",formData);
            setMessage(res.data.message);
        } catch(err){
            setMessage("Upload failed");
        }
    };

    return(
        <div>
            <input
                type="file"
                onChange={(e)=>setFile(e.target.files?.[0] || null)}
            />

            <button onClick={handleIpload}>Upload Payroll</button>

            <p>{message}</p>
        </div>
    );
};

export default UploadForm;