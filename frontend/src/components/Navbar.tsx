import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
    const location = useLocation();

    const navStyle = {
        padding: "20px",
        background: "#222222",
        color: "#FAF3E1",
        borderBottom: "3px solid #FA8112",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    };

    const linkStyle = (isActive: boolean) => ({
        color: isActive ? "#FA8112" : "#FAF3E1",
        textDecoration: "none",
        margin: "0 15px",
        padding: "8px 16px",
        borderRadius: "6px",
        border: isActive ? "2px solid #FA8112" : "2px solid transparent",
        transition: "all 0.2s ease",
        fontWeight: "bold"
    });

    return (
        <div style={navStyle}>
            <h2 style={{ margin: 0, fontSize: "24px" }}>SECLŌ Dashboard</h2>
            <nav>
                <Link to="/" style={linkStyle(location.pathname === "/")}>
                     Dashboard
                </Link>
                <Link to="/status" style={linkStyle(location.pathname === "/status")}>
                    Status
                </Link>
                <Link to="/ai" style={linkStyle(location.pathname === "/ai")}>
                    AI Assistant
                </Link>
            </nav>
        </div>
    );
};

export default Navbar;
