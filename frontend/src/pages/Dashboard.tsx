import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    return (
        <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            backgroundColor: '#FAF3E1',
            minHeight: 'calc(100vh - 80px)'
        }}>
            <h3 style={{ 
                fontSize: '32px', 
                color: '#222222', 
                marginBottom: '30px',
                fontWeight: 'bold'
            }}>
                Welcome to SECLŌ
            </h3>
            
            <div style={{
                backgroundColor: '#F5E7C6',
                padding: '30px',
                borderRadius: '12px',
                border: '2px solid #FA8112',
                maxWidth: '400px',
                margin: '0 auto'
            }}>
                <p style={{ 
                    color: '#222222', 
                    fontSize: '18px', 
                    marginBottom: '25px' 
                }}>
                    Secure payroll processing with privacy-first technology
                </p>
                
                <Link to="/upload" style={{ textDecoration: 'none' }}>
                    <button style={{
                        padding: '15px 30px',
                        backgroundColor: '#FA8112',
                        color: '#FAF3E1',
                        border: '2px solid #222222',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%'
                    }}>
                        Upload Payroll
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;