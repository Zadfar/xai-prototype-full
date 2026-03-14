import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="login-page fade-in">
            <div className="login-container">
                <div className="glass-card login-card">
                    <div className="login-header">
                        <div className="login-icon-box">
                            <i className="ri-shield-keyhole-line"></i>
                        </div>
                        <h2>Officer <strong>Portal</strong></h2>
                        <p>Authorized access only. Please sign in with your bank credentials.</p>
                    </div>
                    
                    {error && (
                        <div className="error-message">
                            <i className="ri-error-warning-line"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="login-form">
                        <div className="input-section">
                            <label className="section-title">Bank Email</label>
                            <div className="input-with-icon">
                                <i className="ri-mail-line"></i>
                                <input 
                                    type="email" 
                                    className="glass-input"
                                    placeholder="officer@zadfar-bank.com"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-section">
                            <label className="section-title">Password</label>
                            <div className="input-with-icon">
                                <i className="ri-lock-2-line"></i>
                                <input 
                                    type="password" 
                                    className="glass-input"
                                    placeholder="••••••••"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="login-footer-actions">
                            <button type="submit" className="primary-btn login-btn" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {loading ? (
                                    <><div className="spinner"></div> Authenticating...</>
                                ) : (
                                    <>Sign In to Dashboard <i className="ri-login-box-line"></i></>
                                )}
                            </button>
                            <button type="button" className="text-btn" onClick={() => navigate('/')}>
                                <i className="ri-arrow-left-line"></i> Back to Landing Page
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;