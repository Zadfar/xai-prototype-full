import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/')}>
                    <i className="ri-bank-line"></i>
                    <span>Bank <strong>XAI</strong></span>
                </div>

                <div className="navbar-actions">
                    <NavLink to="/login" className="login-trigger" title="Officer Portal">
                        <i className="ri-shield-user-line"></i>
                        <span>Officer Login</span>
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
