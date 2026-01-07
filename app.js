const { useState, useEffect } = React;

// --- Components ---

const InputGroup = ({ label, value, onChange, type = "text", options = null, prefix = "", suffix = "" }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>{label}</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {prefix && <span style={{ position: 'absolute', left: '10px', color: '#64748b' }}>{prefix}</span>}

            {options ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: prefix ? '25px' : '10px', width: '100%' }}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: prefix ? '25px' : '10px', paddingRight: suffix ? '25px' : '10px', width: '100%' }}
                />
            )}

            {suffix && <span style={{ position: 'absolute', right: '10px', color: '#64748b' }}>{suffix}</span>}
        </div>
    </div>
);

const ResultCard = ({ result, onReset }) => {
    if (!result) return null;

    const isApproved = result.loan_status === "Approved";
    const statusColor = isApproved ? '#10b981' : '#ef4444'; // Green : Red

    // Helper to render an explanation section
    const ExplanationSection = ({ title, items, icon }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className={icon}></i> {title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {items.map((item, i) => {
                    // Normalize data structure between SHAP (feature/impact_score) and LIME (rule/weight)
                    const label = item.feature || item.rule;
                    const score = item.impact_score || item.weight;
                    const impactDir = item.impact_direction || item.impact; // Positive/Negative

                    return (
                        <div key={i} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '0.6rem',
                            borderRadius: '6px'
                        }}>
                            <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: impactDir === 'Positive' ? '#10b981' : '#ef4444',
                                    background: impactDir === 'Positive' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    padding: '2px 6px', borderRadius: '4px',
                                    fontWeight: '500'
                                }}>
                                    {impactDir}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: '40px', textAlign: 'right' }}>
                                    {score}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            {/* --- Status Header --- */}
            <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: statusColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                fontSize: '2.5rem'
            }}>
                <i className={isApproved ? "ri-check-line" : "ri-close-line"}></i>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                {result.loan_status}
            </h2>
            <div style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                Confidence Score: <span style={{ color: '#fff', fontWeight: '600' }}>{result.confidence_score}</span>
            </div>

            {/* --- Explanations Container --- */}
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <i className="ri-brain-line"></i> AI Reasoning
                </h3>
                
                {/* 1. SHAP Section */}
                <ExplanationSection 
                    title="Key Drivers (Global Trend)" 
                    items={result.explanations.shap_top_factors} 
                    icon="ri-bar-chart-horizontal-line" 
                />

                {/* 2. LIME Section */}
                <ExplanationSection 
                    title="Specific Rules (This Case)" 
                    items={result.explanations.lime_rules} 
                    icon="ri-list-check-2" 
                />
            </div>

            <button className="primary-btn" onClick={onReset}>
                Make Another Application
            </button>
        </div>
    );
};

const App = () => {
    // Initial State corresponding to LoanApplication model
    const initialForm = {
        Gender: 'Male',
        Married: 'No',
        Dependents: '0',
        Education: 'Graduate',
        Self_Employed: 'No',
        ApplicantIncome: 5000,
        CoapplicantIncome: 0,
        LoanAmount: 150,
        Loan_Amount_Term: 360,
        Credit_History: 1.0,
        Property_Area: 'Urban'
    };

    const [formData, setFormData] = useState(initialForm);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateField = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            // Transform numeric inputs
            const payload = {
                ...formData,
                ApplicantIncome: parseFloat(formData.ApplicantIncome),
                CoapplicantIncome: parseFloat(formData.CoapplicantIncome),
                LoanAmount: parseFloat(formData.LoanAmount),
                Loan_Amount_Term: parseFloat(formData.Loan_Amount_Term),
                Credit_History: parseFloat(formData.Credit_History)
            };

            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to connect to backend');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar (Visual only) */}
            <nav className="sidebar">
                <div className="logo-icon"><i className="ri-bank-line"></i></div>
                <div className="nav-item active"><i className="ri-file-text-line"></i></div>
                <div className="nav-item"><i className="ri-history-line"></i></div>

            </nav>

            <main className="dashboard-main" style={{ margin: '0', width: '100%' }}>
                <header className="dashboard-header">
                    <h1>Loan <strong>Predictor</strong></h1>
                    <p style={{ color: '#94a3b8' }}>Fill in the details below to check loan eligibility powered by AI.</p>
                </header>

                <div className="dashboard-content" style={{ marginTop: '2rem' }}>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '2rem' }}>
                            <i className="ri-error-warning-line"></i> {error}
                        </div>
                    )}

                    {!result ? (
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                Applicant Details
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <InputGroup
                                    label="Gender"
                                    value={formData.Gender}
                                    onChange={v => updateField('Gender', v)}
                                    options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                                />
                                <InputGroup
                                    label="Marital Status"
                                    value={formData.Married}
                                    onChange={v => updateField('Married', v)}
                                    options={[{ label: 'Single/No', value: 'No' }, { label: 'Married', value: 'Yes' }]}
                                />
                                <InputGroup
                                    label="Dependents"
                                    value={formData.Dependents}
                                    onChange={v => updateField('Dependents', v)}
                                    options={[
                                        { label: '0', value: '0' },
                                        { label: '1', value: '1' },
                                        { label: '2', value: '2' },
                                        { label: '3+', value: '3+' }
                                    ]}
                                />
                                <InputGroup
                                    label="Education"
                                    value={formData.Education}
                                    onChange={v => updateField('Education', v)}
                                    options={[{ label: 'Graduate', value: 'Graduate' }, { label: 'Not Graduate', value: 'Not Graduate' }]}
                                />
                                <InputGroup
                                    label="Self Employed"
                                    value={formData.Self_Employed}
                                    onChange={v => updateField('Self_Employed', v)}
                                    options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }]}
                                />
                            </div>

                            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                Financial Details
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <InputGroup label="Applicant Income" type="number" prefix="$" value={formData.ApplicantIncome} onChange={v => updateField('ApplicantIncome', v)} />
                                <InputGroup label="Co-Applicant Income" type="number" prefix="$" value={formData.CoapplicantIncome} onChange={v => updateField('CoapplicantIncome', v)} />
                                <InputGroup label="Loan Amount" type="number" prefix="$" value={formData.LoanAmount} onChange={v => updateField('LoanAmount', v)} />
                                <InputGroup label="Loan Term (Days)" type="number" value={formData.Loan_Amount_Term} onChange={v => updateField('Loan_Amount_Term', v)} />
                                <InputGroup
                                    label="Credit History"
                                    value={formData.Credit_History}
                                    onChange={v => updateField('Credit_History', v)}
                                    options={[{ label: 'Good (1.0)', value: 1.0 }, { label: 'Bad (0.0)', value: 0.0 }]}
                                />
                                <InputGroup
                                    label="Property Area"
                                    value={formData.Property_Area}
                                    onChange={v => updateField('Property_Area', v)}
                                    options={[
                                        { label: 'Urban', value: 'Urban' },
                                        { label: 'Semiurban', value: 'Semiurban' },
                                        { label: 'Rural', value: 'Rural' }
                                    ]}
                                />
                            </div>

                            <div style={{ marginTop: '3rem', textAlign: 'right' }}>
                                <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
                                    {loading ? (
                                        <span><i className="ri-loader-4-line ri-spin"></i> Analyzing...</span>
                                    ) : (
                                        <span>Predict Status <i className="ri-arrow-right-line"></i></span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ResultCard result={result} onReset={() => setResult(null)} />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
