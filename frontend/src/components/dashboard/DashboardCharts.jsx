import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
    ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';

export const RiskCreditScatter = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        type="number"
                        dataKey="credit_score"
                        name="Credit Score"
                        unit=""
                        domain={[300, 850]}
                        stroke="#94a3b8"
                        label={{ value: 'Credit Score', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        type="number"
                        dataKey="risk_prob"
                        name="Risk"
                        unit="%"
                        stroke="#94a3b8"
                        label={{ value: 'Risk %', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
                    />
                    <ZAxis type="number" dataKey="loan_amnt" range={[50, 400]} name="Loan Amount" />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Scatter name="Approved" data={data.filter(d => d.status === 'Approved')} fill="#10b981" shape="circle" />
                    <Scatter name="Rejected" data={data.filter(d => d.status === 'Rejected')} fill="#ef4444" shape="triangle" />
                    <Scatter name="Pending" data={data.filter(d => d.status === 'Pending')} fill="#f59e0b" shape="diamond" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export const FunnelChart = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                    <Tooltip
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TrendChart = ({ data }) => {
    if (!data || data.length === 0) return (
        <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            No trend data available for this period.
        </div>
    );

    // Aggressive safety: filter out anything containing 'mock' and force lowercase
    const displayData = data
        .filter(d => d && d.month && typeof d.month === 'string')
        .filter(d => !d.month.toLowerCase().includes('mock') && !d.month.toLowerCase().includes('no data'))
        .map(d => ({
            ...d,
            month: d.month.substring(0, 3).toLowerCase() // e.g., 'january' -> 'jan'
        }));

    return (
        <div style={{ height: 320, width: '100%', marginTop: '1rem' }}>
            <ResponsiveContainer>
                <BarChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <defs>
                        <linearGradient id="barGradientApproved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="barGradientRejected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={15}
                        interval={0}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                        dx={-5}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        contentStyle={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ paddingBottom: '25px', fontSize: '11px', color: '#94a3b8' }}
                    />
                    <Bar
                        dataKey="approved"
                        name="Approved"
                        fill="url(#barGradientApproved)"
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.3))' }}
                    >
                        <LabelList dataKey="approved" position="top" style={{ fill: '#94a3b8', fontSize: '9px' }} />
                    </Bar>
                    <Bar
                        dataKey="rejected"
                        name="Rejected"
                        fill="url(#barGradientRejected)"
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(239, 68, 68, 0.3))' }}
                    >
                        <LabelList dataKey="rejected" position="top" style={{ fill: '#94a3b8', fontSize: '9px' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ProductPerformance = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 250, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.map((item, index) => (
                <div key={index} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem', color: '#94a3b8' }}>
                        <span>{item.name}</span>
                        <span>{item.value}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <div style={{
                            height: '100%',
                            width: `${item.value}%`,
                            background: item.fill || 'var(--primary)',
                            borderRadius: '4px',
                            transition: 'width 1s ease',
                            boxShadow: `0 0 12px ${(item.fill || '#3b82f6')}88`
                        }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const RiskSegmentation = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill} 
                                style={{ 
                                    filter: `drop-shadow(0 0 6px ${entry.fill})`,
                                    outline: 'none'
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ 
                            background: 'rgba(15, 23, 42, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '12px',
                            backdropFilter: 'blur(8px)'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const HomeOwnershipPie = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill} 
                                style={{ 
                                    filter: `drop-shadow(0 0 5px ${entry.fill})`,
                                    outline: 'none'
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ 
                            background: 'rgba(15, 23, 42, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '12px',
                            backdropFilter: 'blur(8px)'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" iconSize={10} wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const DefaultReasons = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} fontSize={12} />
                    <Tooltip
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill} 
                                style={{ filter: `drop-shadow(0 0 6px ${entry.fill}88)` }}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
