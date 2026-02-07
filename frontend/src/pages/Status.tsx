import React, {useEffect, useState} from "react";
import {api} from  "../services/api";

const Status=()=>{
    const [status,setStatus]=useState("");

    useEffect(()=> {
        api.get("/payroll/status").then((res)=>{
            setStatus(res.data.status);
        });
    },[]);

    return (
        <div>
            <h3>WorkFlow Status</h3>
            <p>{status}</p>
        </div>
    );
};

export default Status

