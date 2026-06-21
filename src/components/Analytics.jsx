import React, { useState, useEffect } from 'react';
import { BarChart3, Trash2, Calendar, FileText, CheckCircle, Award } from 'lucide-react';

const categoryColors = {
  battery: '#ef4444',
  biological: '#22c55e',
  'brown-glass': '#b45309',
  cardboard: '#d97706',
  clothes: '#a855f7',
  'green-glass': '#10b981',
  metal: '#78716c',
  paper: '#eab308',
  plastic: '#0ea5e9',
  shoes: '#ec4899',
  trash: '#64748b',
  'white-glass': '#cbd5e1'
};

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load statistics from API.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all sorting history and reset carbon metrics?")) {
      return;
    }
    try {
      const response = await fetch('/api/clear-stats', { method: 'POST' });
      if (response.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--color-primary)',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // Aggregate numbers
  const totalScans = stats ? stats.scans.length : 0;
  const carbonSaved = stats ? stats.carbon_saved : 0.0;
  
  // Calculate relative stats for category distribution
  const counts = stats ? stats.counts : {};
  const maxCount = Math.max(...Object.values(counts), 1);
  const sumCount = Math.max(Object.values(counts).reduce((a, b) => a + b, 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slide-in 0.4s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={24} color="var(--color-primary)" />
            System Analytics & Insights
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Historical record of classified items and cumulative environmental offset.
          </p>
        </div>

        {totalScans > 0 && (
          <button 
            className="btn btn-secondary" 
            onClick={handleClearHistory}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
          >
            <Trash2 size={16} />
            Reset Data History
          </button>
        )}
      </div>

      {totalScans === 0 ? (
        /* Empty State */
        <div className="glass-panel" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-glass)'
          }}>
            <BarChart3 size={32} color="var(--text-muted)" />
          </div>
          <div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Analytics Records Found</h3>
            <p style={{ fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
              Once you classify images via the **Dashboard** or **Real-Time webcam**, statistical graphs and carbon impact charts will automatically render here.
            </p>
          </div>
        </div>
      ) : (
        /* Dashboard layout grids */
        <div className="analytics-grid">
          {/* Left Column: Aggregates and Distribution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Card row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  background: 'var(--color-primary-glow)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <Award size={24} color="var(--color-primary)" />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CO₂ Displaced</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{carbonSaved.toFixed(2)} kg</div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  background: 'var(--color-secondary-glow)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <CheckCircle size={24} color="var(--color-secondary)" />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Model Core Precision</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>~91.4%</div>
                </div>
              </div>
            </div>

            {/* Distribution Graph Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} color="var(--color-primary)" />
                Sorting Material Distribution
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.entries(counts).map(([category, count]) => {
                  const percentage = ((count / sumCount) * 100).toFixed(0);
                  const barWidth = ((count / maxCount) * 100).toFixed(0);
                  const color = categoryColors[category] || 'white';
                  
                  if (count === 0) return null; // Only display sorted categories to look clean

                  return (
                    <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: 'white', fontWeight: 500, textTransform: 'capitalize' }}>
                          {category.replace('-', ' ')}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          <strong>{count}</strong> ({percentage}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          background: color,
                          borderRadius: '5px',
                          transition: 'width 0.8s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Scan Logs */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--color-primary)" />
              Recent Segregation Log
            </h3>
            
            <div style={{
              overflowY: 'auto',
              maxHeight: '380px',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem'
              }}>
                <thead>
                  <tr style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid var(--border-glass)'
                  }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'white', fontWeight: 600 }}>Time</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'white', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'white', fontWeight: 600 }}>Confidence</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'white', fontWeight: 600 }}>CO₂ Saving</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.scans.map((scan) => {
                    const color = categoryColors[scan.category] || 'white';
                    return (
                      <tr key={scan.id} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        color: 'var(--text-secondary)'
                      }}>
                        <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                          <Calendar size={12} color="var(--text-muted)" />
                          {scan.timestamp}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: `${color}15`,
                            color: color,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                          }}>
                            {scan.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'white' }}>
                          {(scan.confidence * 100).toFixed(1)}%
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                          +{scan.carbon_saved.toFixed(2)} kg
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
