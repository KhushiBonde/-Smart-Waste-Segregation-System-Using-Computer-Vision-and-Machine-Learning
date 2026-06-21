import React, { useState, useEffect } from 'react';
import { Upload, FileImage, ShieldAlert, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import ConveyorBelt from './ConveyorBelt';

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
  'white-glass': '#64748b'
};

function Dashboard({ hardwareConfig }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Conveyor Belt States
  const [sortingState, setSortingState] = useState('idle'); // 'idle' | 'moving' | 'done'

  // Summary Metrics loaded from backend
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    carbonSaved: 0.0,
    topCategory: 'None'
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        const total = data.scans.length;
        const carbon = data.carbon_saved || 0.0;
        
        // Determine top category
        let topCat = 'None';
        let maxCount = 0;
        Object.entries(data.counts || {}).forEach(([cat, val]) => {
          if (val > maxCount) {
            maxCount = val;
            topCat = cat;
          }
        });
        
        setMetrics({
          totalScans: total,
          carbonSaved: carbon,
          topCategory: topCat !== 'None' ? topCat.replace('-', ' ').toUpperCase() : 'None'
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    // Validate is image
    if (!selectedFile.type.startsWith('image/')) {
      setError("Please upload a valid image file (PNG, JPG, JPEG).");
      return;
    }
    setError(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResult(null);
    setSortingState('idle');
  };

  const handleClassify = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setSortingState('idle');

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("API classification request failed.");
      }

      const data = await response.json();
      setResult(data);
      setLoading(false);

      // Trigger sorting animation
      setSortingState('moving');
      fetchStats(); // Update aggregated metrics counts
    } catch (err) {
      setError(err.message || "An error occurred during classification.");
      setLoading(false);
    }
  };

  const handleSortComplete = () => {
    setSortingState('done');
  };

  const triggerReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setSortingState('idle');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slide-in 0.4s ease' }}>
      
      {/* Upper Welcome Header & Stats Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>Classification Hub</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Upload waste images manually or simulate the conveyor belt sorting route.
          </p>
        </div>

        {/* Micro Stats Row */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Segregated</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{metrics.totalScans} items</div>
          </div>
          <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CO₂ Saved</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{metrics.carbonSaved} kg</div>
          </div>
          <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Top Category</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
              {metrics.topCategory}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Upload Zone & Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            
            {/* Upload Area */}
            {!previewUrl ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: 'rgba(255, 255, 255, 0.01)'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <input 
                  type="file" 
                  id="file-upload-input" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                  accept="image/*"
                />
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Upload size={28} color="var(--color-primary)" />
                </div>
                <h4 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '0.5rem' }}>
                  Drag & Drop Image Here
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Supports JPEG, JPG, PNG up to 10MB
                </p>
                <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Browse Local Files
                </button>
              </div>
            ) : (
              /* Image Preview Panel with Loading Scan Visuals */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div 
                  className={loading ? 'animate-scan' : ''} 
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '280px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  {loading && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(11, 15, 25, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(2px)'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: 'white',
                        fontWeight: 600,
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '3px solid var(--color-primary)',
                          borderTopColor: 'transparent',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Running CNN Core Model...
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={triggerReset}
                    disabled={loading}
                  >
                    Clear Image
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleClassify}
                    disabled={loading}
                    style={{ minWidth: '140px' }}
                  >
                    {loading ? 'Analyzing...' : 'Sort & Classify'}
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="glass-panel" style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderColor: '#ef4444',
                background: 'rgba(239, 68, 68, 0.05)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                <ShieldAlert size={16} />
                {error}
              </div>
            )}
          </div>

          {/* Conveyor Belt Simulator Component */}
          <ConveyorBelt 
            activeItem={result ? result.category : null}
            predictedAngle={result ? result.servoAngle : 0}
            sortingState={sortingState}
            onSortComplete={handleSortComplete}
          />
        </div>

        {/* Right Side: Prediction results */}
        <div>
          <div className="glass-panel" style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: result ? 'flex-start' : 'center',
            alignItems: result ? 'stretch' : 'center',
            textAlign: result ? 'left' : 'center',
            color: 'var(--text-secondary)',
            gap: '1.5rem'
          }}>
            {!result ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
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
                  <FileImage size={32} color="var(--text-muted)" />
                </div>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Scan Active</h3>
                  <p style={{ fontSize: '0.85rem', maxWidth: '240px', margin: '0 auto' }}>
                    Upload an image file and click the **Sort & Classify** button to view CNN prediction scores.
                  </p>
                </div>
              </div>
            ) : (
              /* Prediction Results Layout */
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    <Sparkles size={14} />
                    Classification Success
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: 'white' }}>Analysis Report</h3>
                </div>

                {/* Score Summary Card */}
                <div className="glass-card" style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Predicted Class</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confidence Score</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: categoryColors[result.category] || 'white',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.02em'
                    }}>
                      {result.category.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'white'
                    }}>
                      {(result.confidence * 100).toFixed(2)}%
                    </span>
                  </div>

                  {/* Custom progress bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${result.confidence * 100}%`,
                      height: '100%',
                      background: categoryColors[result.category],
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>

                {/* Segregation Output Parameters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Servo Target Angle</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '0.2rem' }}>
                      {result.servoAngle}°
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CO₂ Savings</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <TrendingUp size={16} />
                      +{result.carbonSaved} kg
                    </div>
                  </div>
                </div>

                {/* Disposal Suggestions Box */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1.25rem'
                }}>
                  <h4 style={{ color: 'white', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={16} color="var(--color-primary)" />
                    Disposal Recommendation
                  </h4>
                  <p style={{
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                    background: 'rgba(255, 255, 255, 0.01)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {result.suggestion}
                  </p>
                </div>

                {/* Physical Integration Stats */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    background: 'var(--color-primary)',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }} />
                  <span>
                    Simulating Arduino controller trigger using <strong>{hardwareConfig.port}</strong>. Servo command angle: <code>ANGLE_{result.servoAngle}</code> written successfully.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
