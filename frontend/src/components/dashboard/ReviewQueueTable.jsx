import React from 'react';

const ReviewQueueTable = ({ queue, onReviewClick }) => {
    if (queue.length === 0) {
        return <div style={{ color: 'var(--secondary)', textAlign: 'center', padding: '2rem' }}>No pending applications. Queue is clear!</div>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--secondary)' }}>
                        <th style={{ padding: '1rem' }}>Date</th>
                        <th style={{ padding: '1rem' }}>Intent</th>
                        <th style={{ padding: '1rem' }}>Requested Loan</th>
                        <th style={{ padding: '1rem' }}>Income</th>
                        <th style={{ padding: '1rem' }}>AI Default Risk</th>
                        <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {queue.map((app) => (
                        <tr key={app.application_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem', color: '#fff' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>{app.intent}</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>${app.requested_loan.toLocaleString()}</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>${app.applicant_income.toLocaleString()}</td>
                            <td style={{ padding: '1rem', color: 'var(--danger)', fontWeight: 'bold' }}>{app.ai_probability_of_default}</td>
                            <td style={{ padding: '1rem' }}>
                                <button 
                                    onClick={() => onReviewClick(app)}
                                    style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Review Case
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReviewQueueTable;