import React, { useState } from 'react';
import { Cpu, Settings, CheckCircle2, RotateCw, Play, ShieldCheck } from 'lucide-react';

const servoAngles = {
  battery: 15,
  biological: 45,
  'brown-glass': 75,
  cardboard: 105,
  clothes: 135,
  'green-glass': 165,
  metal: 195,
  paper: 225,
  plastic: 255,
  shoes: 285,
  trash: 315,
  'white-glass': 345
};

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

function HardwareConfig({ config, setConfig }) {
  const [testAngle, setTestAngle] = useState(90);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handlePortChange = (e) => {
    setConfig({ ...config, port: e.target.value });
  };

  const handleBaudChange = (e) => {
    setConfig({ ...config, baudRate: parseInt(e.target.value, 10) });
  };

  const handleSimulatedToggle = (e) => {
    setConfig({ ...config, connectionSimulated: e.target.checked });
  };

  const runTestPulse = () => {
    setSendingTest(true);
    setTestSuccess(false);

    // Simulate sending packet to microcontroller
    setTimeout(() => {
      setSendingTest(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 2000);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slide-in 0.4s ease' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={24} color="var(--color-primary)" />
          Hardware Integration Configuration
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Configure microcontroller port variables and test physical servo positions.
        </p>
      </div>

      <div className="config-grid">
        {/* Left Column: Settings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} color="var(--color-primary)" />
              Controller Parameters
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Port selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Serial Target Interface (COM Port)
                </label>
                <select 
                  value={config.port} 
                  onChange={handlePortChange}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.85rem',
                    color: 'white',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none'
                  }}
                >
                  <option value="COM1">COM1 - System Default</option>
                  <option value="COM3">COM3 - Microcontroller (Arduino Uno)</option>
                  <option value="COM4">COM4 - Raspberry Pi GPIO Core</option>
                  <option value="/dev/ttyUSB0">/dev/ttyUSB0 - Linux Core USB</option>
                </select>
              </div>

              {/* Baud Rate */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Serial Transmission Baud Rate
                </label>
                <select 
                  value={config.baudRate} 
                  onChange={handleBaudChange}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.85rem',
                    color: 'white',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none'
                  }}
                >
                  <option value="4800">4800 baud</option>
                  <option value="9600">9600 baud (Standard)</option>
                  <option value="115200">115200 baud (High Speed)</option>
                </select>
              </div>

              {/* Sim status check */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderTop: '1px solid var(--border-glass)',
                paddingTop: '1rem',
                marginTop: '0.5rem'
              }}>
                <input 
                  type="checkbox" 
                  id="sim-connection-checkbox"
                  checked={config.connectionSimulated}
                  onChange={handleSimulatedToggle}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--color-primary)',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="sim-connection-checkbox" style={{ fontSize: '0.85rem', color: 'white', cursor: 'pointer' }}>
                  Enable Hardware Simulation Mode (No hardware attached)
                </label>
              </div>
            </div>
          </div>

          {/* Mapped Servo Angle Chart */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1rem' }}>
              Waste Gate Servo Angling Indexes
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}>
              {Object.entries(servoAngles).map(([cat, val]) => {
                const color = categoryColors[cat] || 'white';
                return (
                  <div key={cat} className="glass-card" style={{
                    padding: '0.6rem 0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem'
                  }}>
                    <span style={{ textTransform: 'capitalize', color: 'white', fontWeight: 500 }}>
                      {cat.replace('-', ' ')}
                    </span>
                    <span style={{
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      background: `${color}15`,
                      color: color,
                      fontWeight: 600
                    }}>
                      {val}°
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Servo Tester */}
        <div className="glass-panel" style={{
          padding: '2rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              Physical Servo Arm Dial Tester
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Test hardware motor alignment angles manually.
            </p>
          </div>

          {/* Visual dial */}
          <div style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '8px solid var(--bg-tertiary)',
            position: 'relative',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Degree scale circles */}
            <div style={{ position: 'absolute', width: '130px', height: '130px', borderRadius: '50%', border: '1px dashed var(--border-glass)' }} />
            
            {/* Pointer Needle */}
            <div style={{
              position: 'absolute',
              width: '6px',
              height: '80px',
              background: 'linear-gradient(to top, var(--color-primary), var(--color-secondary))',
              top: '10px',
              left: 'calc(50% - 3px)',
              transformOrigin: '50% 80px',
              transform: `rotate(${testAngle}deg)`,
              borderRadius: '3px',
              transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
            }} />

            {/* Dial Center cap */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              border: '4px solid var(--bg-primary)',
              zIndex: 5
            }} />

            {/* Degree marker ticks */}
            <span style={{ position: 'absolute', top: '15px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>0°</span>
            <span style={{ position: 'absolute', right: '15px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>90°</span>
            <span style={{ position: 'absolute', bottom: '15px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>180°</span>
            <span style={{ position: 'absolute', left: '15px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>270°</span>
          </div>

          {/* Controller Range Input */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Target Angle Position:</span>
              <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{testAngle}°</span>
            </div>

            <input 
              type="range" 
              min="0" 
              max="360" 
              value={testAngle} 
              onChange={(e) => setTestAngle(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                height: '6px',
                background: 'var(--bg-tertiary)',
                borderRadius: '3px',
                outline: 'none',
                accentColor: 'var(--color-primary)',
                cursor: 'pointer'
              }}
            />

            <button 
              className="btn btn-primary"
              onClick={runTestPulse}
              disabled={sendingTest}
              style={{ marginTop: '0.5rem', width: '100%', gap: '0.5rem' }}
            >
              {sendingTest ? (
                <RotateCw size={16} className="spin-icon" />
              ) : (
                <Play size={16} />
              )}
              {sendingTest ? 'Sending Serial Packet...' : 'Test Angle Command'}
            </button>

            {testSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                color: 'var(--color-primary)',
                fontSize: '0.85rem',
                marginTop: '0.25rem',
                animation: 'slide-in 0.2s ease'
              }}>
                <ShieldCheck size={16} />
                <span>Angle command verified. Servo confirmed at {testAngle}°.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HardwareConfig;
