import React, { useState, useEffect } from 'react';
import {
    fetchKPIs, fetchQueue, fetchTrend,
    fetchProductPerformance, fetchRiskSegmentation, fetchDefaultReasons,
    fetchRiskDistribution, fetchHomeOwnership
} from '../services/dashboardApi';
import {
    TrendChart, ProductPerformance,
    RiskSegmentation, DefaultReasons, RiskCreditScatter, HomeOwnershipPie
} from '../components/dashboard/DashboardCharts';
import ReviewQueueTable from '../components/dashboard/ReviewQueueTable';
import ReviewModal from '../components/dashboard/ReviewModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [queue, setQueue] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [riskData, setRiskData] = useState([]);
    const [reasonData, setReasonData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [homeData, setHomeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error.message);
        } else {
            navigate('/login');
        }
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [
                kpiData, queueData, trend,
                products, risks, reasons, distribution, home
            ] = await Promise.all([
                fetchKPIs(), fetchQueue(), fetchTrend(),
                fetchProductPerformance(), fetchRiskSegmentation(), fetchDefaultReasons(),
                fetchRiskDistribution(), fetchHomeOwnership()
            ]);
            setKpis(kpiData);
            setQueue(queueData);
            setTrendData(trend);
            setProductData(products);
            setRiskData(risks);
            setReasonData(reasons);
            setDistributionData(distribution);
            setHomeData(home);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="fade-in" style={{ paddingBottom: '3rem' }}>
            {/* HEADER */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}><strong>Officer</strong> Overview</h1>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Dashboard &gt; Branch &gt; <span style={{ color: 'var(--primary)' }}>Loan Performance</span></div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="ri-logout-box-r-line"></i> Sign Out
                    </button>
                </div>
            </div>

            {/* TOP KPI ROW */}
            {kpis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                    <KPICard title="Total Application" value={kpis.total_applications.toLocaleString()} trend="+8.4% vs last month" icon="ri-file-list-3-line" />
                    <KPICard title="Approval Rate" value={`${kpis.approval_rate}%`} trend="+2.1%" icon="ri-checkbox-circle-line" />
                    <KPICard title="Disbursement Rate" value={`${kpis.disbursement_rate}%`} trend="Stable" icon="ri-exchange-dollar-line" />
                    <KPICard title="Default Rate" value={`${kpis.default_rate}%`} trend="+0.4%" icon="ri-error-warning-line" />
                    <KPICard title="Current NPA %" value={`${kpis.current_npa}%`} trend="Above Threshold" icon="ri-pie-chart-2-line" color="var(--danger)" />
                </div>
            )}

            {/* STRATEGIC INSIGHTS ROW */}
            {/* RISK & SEGMENTATION ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* [UI-1] RISK VS CREDIT SCORE DISTRIBUTION: Renders a scatter plot mapping credit scores against default probability. */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-bubble-chart-line"></i> Risk vs Credit Score Distribution</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Portfolio mapping: Credit score vs default probability</div>
                    <RiskCreditScatter data={distributionData} />
                </div>

                {/* [UI-2] RISK SEGMENTATION: Visualization of portfolio risk buckets (Low, Med, High). */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-donut-chart-line"></i> Risk Segmentation</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Portfolio breakdown by risk category</div>
                    <div style={{ marginTop: '2rem' }}>
                        <RiskSegmentation data={riskData} />
                    </div>
                </div>
            </div>

            {/* TREND & PERFORMANCE ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* [UI-3] APPROVED VS REJECTED TREND: Timeline chart showing monthly application decision outcomes. */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><i className="ri-line-chart-line"></i> Approved vs Rejected Trend</span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>12 Month History</span>
                    </div>
                    <TrendChart data={trendData} />
                </div>

                {/* [UI-4] PRODUCT PERFORMANCE: Chart showing the distribution of loan intents. */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-bar-chart-box-line"></i> Product Performance</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Approval volume by loan purpose</div>
                    <ProductPerformance data={productData} />
                </div>
            </div>

            {/* DRILL-DOWN GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* [UI-5] HOME OWNERSHIP: Demographic breakdown based on housing status. */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-home-4-line"></i> Home Ownership</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Applicant demographic profile</div>
                    <HomeOwnershipPie data={homeData} />
                </div>

                {/* [UI-6] TOP DEFAULT REASONS: AI insights into the primary factors causing application rejections. */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-list-alert-line"></i> Top Default Reasons</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>AI-derived risk factors</div>
                    <DefaultReasons data={reasonData} />
                </div>

                {/* [UI-7] CRITICAL ALERTS: Notification panel for system-flagged portfolio risks. */}
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f97316' }}>
                    <div style={{ color: '#f97316', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                        <i className="ri-notification-3-line"></i> Critical Alerts
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        {kpis && kpis.alerts && kpis.alerts.length > 0 ? (
                            kpis.alerts.map((alert, idx) => (
                                <AlertItem key={idx} icon={alert.icon} text={alert.text} />
                            ))
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No critical alerts. Portfolio stable.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* QUEUE TABLE */}
            <div className="glass-card" style={{ maxWidth: '100%', padding: '0' }}>
                <div className="card-title" style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
                    <i className="ri-list-check-2"></i> Manual Review Queue
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <ReviewQueueTable
                        queue={queue}
                        onReviewClick={(app) => setSelectedApp(app)}
                    />
                </div>
            </div>

            {/* DECISION MODAL */}
            {selectedApp && (
                <ReviewModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onSuccess={() => {
                        setSelectedApp(null);
                        loadDashboardData();
                    }}
                />
            )}
        </div>
    );
};

// Helper Components
const KPICard = ({ title, value, trend, icon, color = '#fff' }) => (
    <div className="glass-card" style={{ padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>{title}</span>
            <i className={`${icon}`} style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.2)' }}></i>
        </div>
        <h2 style={{ fontSize: '1.8rem', color: color, margin: '0.2rem 0' }}>{value}</h2>
        <div style={{ fontSize: '0.75rem', color: trend.includes('+') ? 'var(--success)' : (trend.includes('Above') ? 'var(--danger)' : '#94a3b8') }}>
            {trend.includes('+') ? <i className="ri-arrow-up-line"></i> : trend.includes('Above') ? <i className="ri-arrow-up-line"></i> : null} {trend}
        </div>
    </div>
);

const AlertItem = ({ icon, text }) => (
    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.8rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
        <i className={icon} style={{ color: '#f97316', marginTop: '2px' }}></i>
        <span>{text}</span>
    </div>
);

const DashboardSkeleton = () => (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
        {/* HEADER SKELETON */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
                <div className="skeleton" style={{ width: '250px', height: '2.5rem', marginBottom: '0.5rem' }}></div>
                <div className="skeleton" style={{ width: '180px', height: '1rem' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="skeleton" style={{ width: '120px', height: '2.5rem' }}></div>
            </div>
        </div>

        {/* KPI CARDS SKELETON */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-card" style={{ height: '120px' }}>
                    <div className="skeleton" style={{ width: '60%', height: '1rem', marginBottom: '1rem' }}></div>
                    <div className="skeleton" style={{ width: '80%', height: '2rem', marginBottom: '0.5rem' }}></div>
                    <div className="skeleton" style={{ width: '40%', height: '0.8rem' }}></div>
                </div>
            ))}
        </div>

        {/* CHARTS SKELETON ROW 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="skeleton-card" style={{ height: '400px' }}>
                <div className="skeleton" style={{ width: '40%', height: '1.5rem', marginBottom: '1.5rem' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
            </div>
            <div className="skeleton-card" style={{ height: '400px' }}>
                <div className="skeleton" style={{ width: '40%', height: '1.5rem', marginBottom: '1.5rem' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
            </div>
        </div>

        {/* CHARTS SKELETON ROW 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="skeleton-card" style={{ height: '400px' }}>
                <div className="skeleton" style={{ width: '40%', height: '1.5rem', marginBottom: '1.5rem' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
            </div>
            <div className="skeleton-card" style={{ height: '400px' }}>
                <div className="skeleton" style={{ width: '40%', height: '1.5rem', marginBottom: '1.5rem' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
            </div>
        </div>

        {/* DRILL-DOWN GRID SKELETON */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="skeleton-card" style={{ height: '350px' }}>
                <div className="skeleton" style={{ width: '50%', height: '1.5rem', marginBottom: '1.5rem' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '250px' }}></div>
            </div>
            <div className="skeleton-card" style={{ height: '350px' }}>
                <div className="skeleton" style={{ width: '50%', height: '1.5rem', marginBottom: '1.5rem' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '250px' }}></div>
            </div>
            <div className="skeleton-card" style={{ height: '350px', borderLeft: '4px solid rgba(249, 115, 22, 0.2)' }}>
                <div className="skeleton" style={{ width: '50%', height: '1.5rem', marginBottom: '1.5rem' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton" style={{ width: '100%', height: '1rem' }}></div>
                    ))}
                </div>
            </div>
        </div>

        {/* TABLE SKELETON */}

        <div className="skeleton-card" style={{ height: '300px' }}>
            <div className="skeleton" style={{ width: '30%', height: '1.5rem', marginBottom: '1.5rem' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton" style={{ width: '100%', height: '2.5rem' }}></div>
                ))}
            </div>
        </div>
    </div>
);


export default Dashboard;