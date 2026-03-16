import React, { useState } from 'react';
import { submitDecision } from '../../services/dashboardApi';

const ReviewModal = ({ application, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentOfficerName = "Officer_Admin_01"; 

    const handleDecision = async (decisionType) => {
        if (reason.length < 5) {
            setError("You must provide a detailed reason for the audit log (min 5 characters).");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await submitDecision(application.application_id, {
                decision: decisionType,
                officer_name: currentOfficerName,
                override_reason: reason
            });
            onSuccess();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Helper to format feature names (e.g., "loan_percent_income" -> "Loan Percent Income")
    const formatFeatureName = (name) => {
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '900px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', margin: 'auto' }}>
                
                {/* MODAL HEADER */}
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                        <h3 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="ri-file-search-line" style={{ color: 'var(--primary)' }}></i> 
                            Application Review
                        </h3>
                        <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                            ID: {application.application_id}
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }} 
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} 
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <i className="ri-close-line" style={{ fontSize: '1.2rem' }}></i>
                    </button>
                </div>

                {/* SCROLLABLE CONTENT BODY */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    
                    {/* LEFT COLUMN: APPLICANT DATA */}
                    <div>
                        <div className="section-title"><i className="ri-user-line"></i> Applicant Profile</div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Requested Loan</div>
                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>${application.requested_loan?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Annual Income</div>
                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>${application.applicant_income?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Credit Score</div>
                                    <div style={{ color: '#fff', fontSize: '1.1rem' }}>{application.credit_score}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Loan Intent</div>
                                    <div style={{ color: '#fff', fontSize: '1.1rem' }}>{application.intent}</div>
                                </div>
                            </div>
                        </div>

                        <div className="section-title"><i className="ri-route-line"></i> AI Action Plan (DiCE)</div>
                        {application.action_plan && application.action_plan.length > 0 ? (
                            application.action_plan.map((plan, index) => (
                                <div key={index} style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                    <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Path {index + 1} to Safe Approval:</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#fff', fontSize: '0.9rem' }}>
                                        {plan.map((step, i) => <li key={i} style={{ marginBottom: '4px' }}>{step}</li>)}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No alternative paths generated.</div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: AI ANALYSIS */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                            <div className="section-title" style={{ margin: 0 }}><i className="ri-brain-line"></i> AI Risk Assessment</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{application.ai_probability_of_default} Risk</div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                            <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 'bold' }}>Top Influencing Factors (SHAP)</div>
                            
                            {application.shap_explanations?.map((factor, idx) => {
                                const isRisk = factor.impact_direction.includes('Risk');
                                return (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: idx !== application.shap_explanations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{formatFeatureName(factor.feature)}</div>
                                        <div style={{ color: isRisk ? '#fca5a5' : '#86efac', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', background: isRisk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                                            <i className={isRisk ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
                                            {Math.abs(factor.impact_score).toFixed(2)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* FOOTER: AUDIT LOGIC & ACTIONS */}
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)' }}>
                    {error && <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}><i className="ri-error-warning-line"></i> {error}</div>}
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Officer Audit Justification (Required)</label>
                        <textarea 
                            className="glass-input"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="State the official reason for overriding or confirming the AI's assessment..."
                            style={{ minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button 
                            disabled={loading}
                            onClick={() => handleDecision("Rejected")}
                            style={{ padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                        >
                            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fca5a5' }}></div> Processing...</> : 'Reject Application'}
                        </button>
                        <button 
                            disabled={loading}
                            onClick={() => handleDecision("Approved")}
                            style={{ padding: '0.75rem 1.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#86efac', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                        >
                            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#86efac' }}></div> Processing...</> : 'Approve Application'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReviewModal;