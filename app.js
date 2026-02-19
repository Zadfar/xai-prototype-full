const { useState } = React;
const { createRoot } = ReactDOM;

// --- Helper Components ---

const InputGroup = ({ label, value, onChange, type = "text", options = null }) => (
    <div style={{ marginBottom: '1.2rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            {label}
        </label>
        {options ? (
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="glass-input"
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
            />
        )}
    </div>
);

const ActionPlan = ({ plans }) => {
    if (!plans || plans.length === 0) return null;

    return (
        <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', // Subtle green background
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '1.5rem', 
            borderRadius: '16px', 
            marginTop: '2rem',
            textAlign: 'left'
        }}>
            <h3 style={{ color: '#86efac', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ri-route-line"></i> Path to Approval
            </h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Our AI found {plans.length} alternative scenarios where your loan would be approved:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {plans.map((planGroup, index) => (
                    <div key={index} style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        padding: '1rem', 
                        borderRadius: '8px' 
                    }}>
                        <strong style={{ color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase' }}>Option {index + 1}:</strong>
                        <ul style={{ color: '#e2e8f0', marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
                            {planGroup.map((step, i) => (
                                <li key={i} style={{ marginBottom: '0.3rem' }}>{step}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ResultCard = ({ result, onReset }) => {
    const isApproved = result.loan_status === "Approved";
    const statusColor = isApproved ? 'var(--success)' : 'var(--danger)'; 

    return (
        <div className="glass-card fade-in" style={{ 
            width: '100%', 
            maxWidth: '1000px', 
            margin: '0 auto',
            maxHeight: '85vh',       /* Restricts height to 85% of the viewport */
            overflowY: 'auto',       /* Adds a vertical scrollbar when content overflows */
            paddingRight: '1rem'     /* Adds a little padding so the scrollbar doesn't hug the text */
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fff' }}>
                    {result.loan_status}
                </h2>
                <div style={{ color: 'var(--secondary)' }}>
                    Probability of Default: <span style={{ color: '#fff', fontWeight: '500' }}>{result.probability_of_default}</span>
                </div>
                <div style={{ marginTop: '1rem' }}>
                     <span style={{ 
                         padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                         background: result.risk_category === "High Risk" ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                         color: result.risk_category === "High Risk" ? '#fca5a5' : '#86efac'
                     }}>
                        {result.risk_category}
                    </span>
                </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', color: '#fff' }}>
                    <i className="ri-brain-line"></i> AI Analysis
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* SHAP Factors */}
                    <div>
                        <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <i className="ri-bar-chart-horizontal-line"></i> Key Drivers (SHAP)
                        </h4>
                        {result.explanations?.shap_top_factors?.map((item, i) => (
                            <div key={i} style={{ 
                                display: 'flex', justifyContent: 'space-between', 
                                background: 'rgba(255,255,255,0.03)', padding: '0.75rem', 
                                borderRadius: '8px', marginBottom: '0.5rem' 
                            }}>
                                <span style={{ fontSize: '0.9rem' }}>{item.feature}</span>
                                <span style={{ 
                                    color: item.impact_direction.includes("Increases") ? 'var(--danger)' : 'var(--success)',
                                    fontWeight: '600', fontSize: '0.9rem'
                                }}>
                                    {item.impact_score}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* LIME Rules */}
                    <div>
                        <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <i className="ri-list-check-2"></i> Specific Rules (LIME)
                        </h4>
                        {Array.isArray(result.explanations?.lime_rules) ? (
                            result.explanations.lime_rules.map((item, i) => (
                                <div key={i} style={{ 
                                    marginBottom: '0.5rem', fontSize: '0.9rem', 
                                    background: 'rgba(255,255,255,0.03)', padding: '0.75rem', 
                                    borderRadius: '8px',
                                    wordBreak: 'break-word'
                                }}>
                                    {item.rule}
                                </div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--secondary)', fontStyle: 'italic', padding: '0.75rem' }}>
                                {result.explanations?.lime_rules}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTION PLAN (DiCE Counterfactuals) */}
            {!isApproved && result.action_plan && result.action_plan.length > 0 && (
                <div style={{ 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '1.5rem', 
                    borderRadius: '16px', 
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <h3 style={{ color: '#86efac', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="ri-route-line"></i> Path to Approval
                    </h3>
                    <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Our AI found alternative scenarios where your loan would be approved:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {result.action_plan.map((planGroup, index) => (
                            <div key={index} style={{ 
                                background: 'rgba(0,0,0,0.3)', 
                                padding: '1rem', 
                                borderRadius: '8px' 
                            }}>
                                <strong style={{ color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase' }}>Option {index + 1}:</strong>
                                <ul style={{ color: '#e2e8f0', marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
                                    {planGroup.map((step, i) => (
                                        <li key={i} style={{ marginBottom: '0.3rem' }}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center' }}>
                <button className="primary-btn" onClick={onReset}>
                    Assess Another Applicant <i className="ri-refresh-line" style={{ marginLeft: '8px' }}></i>
                </button>
            </div>
        </div>
    );
};

const App = () => {
    const initialForm = {
        person_age: 25,
        person_gender: 'male',
        person_education: 'Bachelor',
        person_income: 55000,
        person_emp_exp: 2,
        person_home_ownership: 'RENT',
        loan_amnt: 10000,
        loan_intent: 'PERSONAL',
        loan_int_rate: 11.5,
        cb_person_cred_hist_length: 3,
        credit_score: 650,
        previous_loan_defaults_on_file: 'No'
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
            const calculatedPercent = formData.person_income > 0 
                ? (parseFloat(formData.loan_amnt) / parseFloat(formData.person_income)) 
                : 0;

            const payload = {
                ...formData,
                person_age: parseInt(formData.person_age),
                person_income: parseFloat(formData.person_income),
                person_emp_exp: parseInt(formData.person_emp_exp),
                loan_amnt: parseFloat(formData.loan_amnt),
                loan_int_rate: parseFloat(formData.loan_int_rate),
                loan_percent_income: parseFloat(calculatedPercent.toFixed(2)),
                cb_person_cred_hist_length: parseInt(formData.cb_person_cred_hist_length),
                credit_score: parseInt(formData.credit_score)
            };

            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to connect');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar matching old CSS */}
            <nav className="sidebar">
                <div className="logo-icon"><i className="ri-bank-line"></i></div>
                <div className="nav-item active"><i className="ri-file-text-line"></i></div>
                <div className="nav-item"><i className="ri-history-line"></i></div>
                <div className="nav-item"><i className="ri-settings-4-line"></i></div>
            </nav>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>Loan <strong>Predictor</strong></h1>
                    <p style={{ color: 'var(--secondary)' }}>Fill in the details below to check loan eligibility powered by AI.</p>
                </header>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '2rem' }}>
                        <i className="ri-error-warning-line"></i> {error}
                    </div>
                )}

                {!result ? (
                    <div className="glass-card fade-in">
                        <h2 className="card-title" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                            <i className="ri-user-line"></i> Applicant Details
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1.5rem' }}>
                            {/* Personal Info */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Personal</h3>
                                <InputGroup label="Age" type="number" value={formData.person_age} onChange={v => updateField('person_age', v)} />
                                <InputGroup label="Gender" value={formData.person_gender} onChange={v => updateField('person_gender', v)} options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} />
                                <InputGroup label="Education" value={formData.person_education} onChange={v => updateField('person_education', v)} options={[{ label: 'High School', value: 'High School' }, { label: 'Associate', value: 'Associate' }, { label: 'Bachelor', value: 'Bachelor' }, { label: 'Master', value: 'Master' }, { label: 'Doctorate', value: 'Doctorate' }]} />
                                <InputGroup label="Home Ownership" value={formData.person_home_ownership} onChange={v => updateField('person_home_ownership', v)} options={[{ label: 'Rent', value: 'RENT' }, { label: 'Own', value: 'OWN' }, { label: 'Mortgage', value: 'MORTGAGE' }, { label: 'Other', value: 'OTHER' }]} />
                            </div>

                            {/* Financial Info */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Financial</h3>
                                <InputGroup label="Annual Income ($)" type="number" value={formData.person_income} onChange={v => updateField('person_income', v)} />
                                <InputGroup label="Employment Exp (Years)" type="number" value={formData.person_emp_exp} onChange={v => updateField('person_emp_exp', v)} />
                                <InputGroup label="Loan Amount ($)" type="number" value={formData.loan_amnt} onChange={v => updateField('loan_amnt', v)} />
                                <InputGroup label="Intent" value={formData.loan_intent} onChange={v => updateField('loan_intent', v)} options={[{ label: 'Personal', value: 'PERSONAL' }, { label: 'Education', value: 'EDUCATION' }, { label: 'Medical', value: 'MEDICAL' }, { label: 'Venture', value: 'VENTURE' }, { label: 'Home Improvement', value: 'HOMEIMPROVEMENT' }, { label: 'Debt Consolidation', value: 'DEBTCONSOLIDATION' }]} />
                            </div>

                            {/* Credit Info */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Credit Profile</h3>
                                <InputGroup label="Interest Rate (%)" type="number" value={formData.loan_int_rate} onChange={v => updateField('loan_int_rate', v)} />
                                <InputGroup label="Credit Score" type="number" value={formData.credit_score} onChange={v => updateField('credit_score', v)} />
                                <InputGroup label="Credit History (Years)" type="number" value={formData.cb_person_cred_hist_length} onChange={v => updateField('cb_person_cred_hist_length', v)} />
                                <InputGroup label="Prior Defaults" value={formData.previous_loan_defaults_on_file} onChange={v => updateField('previous_loan_defaults_on_file', v)} options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }]} />
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                            <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
                                {loading ? (
                                    <><i className="ri-loader-4-line ri-spin"></i> Analyzing...</>
                                ) : (
                                    <>Predict Status <i className="ri-arrow-right-line"></i></>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <ResultCard result={result} onReset={() => setResult(null)} />
                )}
            </main>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);