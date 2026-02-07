import React from "react";
import { Link } from "react-router-dom";

const Dashboard=()=>{
    return(
        <div>
            <h3>Welcome to SECLŌ</h3>
            <Link to= "/upload">
                <button>Upload Payroll</button>
            </Link>
        </div>
    );
};


export default Dashboard;