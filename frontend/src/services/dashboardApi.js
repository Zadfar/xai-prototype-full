const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const fetchKPIs = async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/kpis`);
    if (!response.ok) throw new Error('Failed to fetch KPIs');
    return response.json();
};

export const fetchQueue = async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/queue`);
    if (!response.ok) throw new Error('Failed to fetch review queue');
    return response.json();
};

export const submitDecision = async (applicationId, decisionData) => {
    const response = await fetch(`${BASE_URL}/api/dashboard/applications/${applicationId}/decision`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(decisionData),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to submit decision');
    }
    return response.json();
};


export const fetchTrend = async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/trend`);
    if (!response.ok) throw new Error('Failed to fetch trend data');
    return response.json();
};

export const fetchProductPerformance = async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/product-performance`);
    if (!response.ok) throw new Error('Failed to fetch product performance');
    return response.json();
};

export const fetchRiskSegmentation = async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/risk-segmentation`);
    if (!response.ok) throw new Error('Failed to fetch risk segmentation');
    return response.json();
};

export const fetchDefaultReasons = async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/default-reasons`);
    if (!response.ok) throw new Error('Failed to fetch default reasons');
    return response.json();
};

export const fetchRiskDistribution = async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/risk-distribution`);
    if (!response.ok) throw new Error('Failed to fetch risk distribution');
    return response.json();
};

export const fetchHomeOwnership = async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/home-ownership`);
    if (!response.ok) throw new Error('Failed to fetch home ownership stats');
    return response.json();
};