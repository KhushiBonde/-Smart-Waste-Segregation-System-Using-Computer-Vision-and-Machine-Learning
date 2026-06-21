import React, { useRef, useState, useEffect } from 'react';
import { Camera, Radio, VideoOff, AlertTriangle, RefreshCw, StopCircle } from 'lucide-react';
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
  'white-glass': '#f1f5f9'
};

function RealTimeSort({ hardwareConfig }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Sorting Animation State
  const [sortingState, setSortingState] = useState('idle'); // 'idle' | 'moving' | 'done'

  // Auto Segregation Loop State
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Start webcam stream
  const startStream = async () => {
    setStreamError(null);
    try {
      const constraints = {
        video: { width: 640, height: 480, facingMode: 'environment' }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.error("Webcam stream failed", err);
      setStreamError("Failed to access camera. Please check permissions or select manual upload.");
    }
  };

  // Stop webcam stream
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
    setAutoPilotActive(false);
  };

  // Turn off streams on unmount
  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, []);

  // Capture Frame and Classify
  const captureAndClassify = async () => {
    if (!videoRef.current || !canvasRef.current || loading) return;

    setLoading(true);
    setResult(null);
    setSortingState('idle');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Sync canvas sizing with stream
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob and compile FormData
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to capture image blob.");
        }

        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch('/api/classify', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error("API classification failed.");

          const data = await response.json();
          setResult(data);
          setLoading(false);
          setSortingState('moving'); // Begin conveyor segregation sequence
        } catch (err) {
          console.error("Webcam classify request error:", err);
          setLoading(false);
          setAutoPilotActive(false);
        }
      }, 'image/jpeg', 0.9);

    } catch (err) {
      console.error(err);
      setLoading(false);
      setAutoPilotActive(false);
    }
  };

  // Auto-Pilot Cycle Manager
  useEffect(() => {
    let timer;
    if (autoPilotActive && streamActive) {
      setCountdown(6); // 6-second cycles
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Trigger capture
            captureAndClassify();
            return 6; // Reset countdown
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoPilotActive, streamActive]);

  const handleSortComplete = () => {
    setSortingState('done');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slide-in 0.4s ease' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={24} color="var(--color-primary)" className="pulse-dot" />
            Real-Time Sorting Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Identify waste items directly via device camera and automate separation cycles.
          </p>
        </div>

        {/* Action button triggers */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {streamActive ? (
            <>
              <button 
                className={`btn ${autoPilotActive ? 'btn-danger' : 'btn-secondary'}`} 
                onClick={() => setAutoPilotActive(!autoPilotActive)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {autoPilotActive ? (
                  <>
                    <StopCircle size={16} />
                    Stop Auto-Pilot
                  </>
                ) : (
                  <>
                    <Radio size={16} color="var(--color-primary)" />
                    Run Auto-Pilot Loop
                  </>
                )}
              </button>
              <button className="btn btn-secondary" onClick={stopStream}>
                Power Off Camera
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={startStream}>
              Initialize Camera
            </button>
          )}
        </div>
      </div>

      {/* Main Grid split */}
      <div className="dashboard-grid">
        {/* Left Side: Camera view finder & Conveyor Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            
            {/* Viewfinder frame */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '340px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#070a13',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: streamActive ? 'block' : 'none',
                  transform: 'scaleX(-1)' // Mirror for intuitive usage
                }}
              />
              
              {/* Overlay Laser grid lines */}
              {streamActive && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  pointerEvents: 'none'
                }}>
                  {/* Scope sight markings */}
                  <div style={{ position: 'absolute', width: '20px', height: '20px', borderTop: '2px solid var(--color-primary)', borderLeft: '2px solid var(--color-primary)', top: 20, left: 20 }} />
                  <div style={{ position: 'absolute', width: '20px', height: '20px', borderTop: '2px solid var(--color-primary)', borderRight: '2px solid var(--color-primary)', top: 20, right: 20 }} />
                  <div style={{ position: 'absolute', width: '20px', height: '20px', borderBottom: '2px solid var(--color-primary)', borderLeft: '2px solid var(--color-primary)', bottom: 20, left: 20 }} />
                  <div style={{ position: 'absolute', width: '20px', height: '20px', borderBottom: '2px solid var(--color-primary)', borderRight: '2px solid var(--color-primary)', bottom: 20, right: 20 }} />
                </div>
              )}

              {/* Scanning visual laser */}
              {loading && <div className="animate-scan" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />}

              {/* Camera Offline screen */}
              {!streamActive && !streamError && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <VideoOff size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ color: 'white' }}>Feed Inactive</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Press Initialize Camera above to activate webcam stream.
                  </p>
                </div>
              )}

              {/* Error screen */}
              {streamError && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#fca5a5' }}>
                  <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ color: 'white' }}>Camera Access Denied</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                    {streamError}
                  </p>
                </div>
              )}

              {/* Auto Pilot Cycle Countdown Pill */}
              {autoPilotActive && (
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <RefreshCw size={12} className="spin-icon" />
                  <span>AUTOPILOT SCAN IN: {countdown}s</span>
                </div>
              )}
            </div>

            {/* Hidden capture canvas helper */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Action buttons */}
            {streamActive && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={captureAndClassify}
                  disabled={loading}
                  style={{ minWidth: '180px' }}
                >
                  <Camera size={18} />
                  {loading ? 'Analyzing frame...' : 'Capture & Segregate'}
                </button>
              </div>
            )}
          </div>

          {/* Conveyor Belt Simulator */}
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
            minHeight: '450px',
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
                  <Camera size={32} color="var(--text-muted)" />
                </div>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Camera Capture</h3>
                  <p style={{ fontSize: '0.85rem', maxWidth: '240px', margin: '0 auto' }}>
                    Click the **Capture & Segregate** button to snap and process the current video viewfinder frame.
                  </p>
                </div>
              </div>
            ) : (
              /* Live Results report */
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Live Snapshot Summary
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: 'white' }}>Optical Analysis Report</h3>
                </div>

                {/* Main Class Card */}
                <div className="glass-card" style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detected Class</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Model Confidence</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: categoryColors[result.category] || 'white',
                      fontFamily: 'var(--font-display)'
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

                  {/* progress bar */}
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

                {/* output parameters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Servo Sorting Angle</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '0.2rem' }}>
                      {result.servoAngle}°
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CO₂ Saved Impact</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-secondary)', marginTop: '0.2rem' }}>
                      +{result.carbonSaved} kg
                    </div>
                  </div>
                </div>

                {/* Disposal Suggestions Box */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '1.25rem'
                }}>
                  <h4 style={{ color: 'white', fontSize: '0.95rem' }}>
                    Disposal Recommendation
                  </h4>
                  <p style={{
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                    background: 'rgba(255, 255, 255, 0.01)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)'
                  }}>
                    {result.suggestion}
                  </p>
                </div>

                {/* Arduino microcontroller message */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    background: 'var(--color-secondary)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginRight: '0.5rem'
                  }} />
                  <span>
                    Simulated command sent to <strong>{hardwareConfig.port}</strong>. Arduino servo angle rotated to: <code>{result.servoAngle}°</code>.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .pulse-dot {
          animation: pulse-dot 1.5s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default RealTimeSort;
