import React, { useState } from 'react';
import LoanForm from '../components/LoanForm';
import ResultCard from '../components/ResultCard';
import { predictLoan } from '../services/api';

const LoanApplicationPage = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFormSubmit = async (formData) => {
        setLoading(true);
        setError(null);
        
        try {
            const aiResponse = await predictLoan(formData);
            setResult(aiResponse);
            // Scroll to result card
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.message || 'Failed to connect to the AI model.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="landing-page fade-in">
            {!result ? (
                <>
                    <section className="hero-section">
                        <div className="hero-content">
                            <h1 className="hero-title">
                                Secure Your Future with <br />
                                <span>AI-Powered</span> Loan Approvals
                            </h1>
                            <p className="hero-subtitle">
                                Experience the next generation of credit assessment. Our advanced Explainable AI (XAI) 
                                analyzes your profile in seconds to provide instant, transparent loan status predictions.
                            </p>
                            <div className="hero-badges">
                                <div className="badge">
                                    <i className="ri-shield-check-line"></i>
                                    <span>Secure & Private</span>
                                </div>
                                <div className="badge">
                                    <i className="ri-flashlight-line"></i>
                                    <span>Instant Analysis</span>
                                </div>
                                <div className="badge">
                                    <i className="ri-billiards-line"></i>
                                    <span>99% Accuracy</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="form-section" id="application-form">
                        <div className="section-header">
                            <h2>Start Your <strong>Application</strong></h2>
                            <p>Fill in your details below for an instant AI assessment.</p>
                        </div>
                        <LoanForm 
                            onSubmit={handleFormSubmit} 
                            loading={loading} 
                            error={error} 
                        />
                    </section>
                </>
            ) : (
                <div className="result-container" style={{ paddingTop: '2rem' }}>
                    <ResultCard 
                        result={result} 
                        onReset={() => setResult(null)} 
                    />
                </div>
            )}
            
            <footer className="landing-footer">
                <p>&copy; 2024 Zadfar XAI Prototype. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LoanApplicationPage;