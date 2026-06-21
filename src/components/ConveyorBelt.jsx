import React, { useEffect, useState } from 'react';
import { Settings, RefreshCw } from 'lucide-react';

const categoryColors = {
  battery: '#ef4444',     // Red
  biological: '#22c55e',  // Green
  'brown-glass': '#b45309', // Brown
  cardboard: '#d97706',    // Amber
  clothes: '#a855f7',     // Purple
  'green-glass': '#10b981', // Emerald
  metal: '#78716c',       // Stone
  paper: '#eab308',       // Yellow
  plastic: '#0ea5e9',     // Sky Blue
  shoes: '#ec4899',       // Pink
  trash: '#64748b',       // Slate
  'white-glass': '#f1f5f9' // White/Clear
};

const categoryEmojis = {
  battery: '🔋',
  biological: '🍎',
  'brown-glass': '🟫🍾',
  cardboard: '📦',
  clothes: '👕',
  'green-glass': '🟢🍾',
  metal: '🥫',
  paper: '📄',
  plastic: '🧴',
  shoes: '👟',
  trash: '🗑️',
  'white-glass': '🧪'
};

const categoryLabels = {
  battery: 'Hazardous (Battery)',
  biological: 'Organic (Biological)',
  'brown-glass': 'Brown Glass',
  cardboard: 'Cardboard',
  clothes: 'Textile (Clothes)',
  'green-glass': 'Green Glass',
  metal: 'Metal/Cans',
  paper: 'Paper',
  plastic: 'Plastic',
  shoes: 'Textile (Shoes)',
  trash: 'General Trash',
  'white-glass': 'Clear Glass'
};

function ConveyorBelt({ activeItem, predictedAngle, sortingState, onSortComplete }) {
  const [position, setPosition] = useState(0); // 0 to 100%
  const [servoRotation, setServoRotation] = useState(0);
  const [selectedBin, setSelectedBin] = useState(null);

  useEffect(() => {
    if (sortingState === 'idle') {
      setPosition(0);
      setServoRotation(0);
      setSelectedBin(null);
    } else if (sortingState === 'moving') {
      // Phase 1: Item moves down conveyor belt to the sensor/servo gate
      let currentPos = 0;
      const interval = setInterval(() => {
        currentPos += 1.5;
        if (currentPos >= 45) {
          clearInterval(interval);
          setPosition(45);
          // Wait briefly, then simulate servo rotation
          setTimeout(() => {
            setServoRotation(predictedAngle);
            setTimeout(() => {
              // Phase 2: Resume conveyor movement, items shift towards specific bin direction
              let nextPos = 45;
              const nextInterval = setInterval(() => {
                nextPos += 2;
                if (nextPos >= 90) {
                  clearInterval(nextInterval);
                  setPosition(90);
                  // Item drops into bin
                  setTimeout(() => {
                    setPosition(100);
                    setSelectedBin(activeItem);
                    setTimeout(() => {
                      if (onSortComplete) onSortComplete();
                    }, 800);
                  }, 200);
                } else {
                  setPosition(nextPos);
                }
              }, 30);
            }, 600);
          }, 400);
        } else {
          setPosition(currentPos);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [sortingState, activeItem, predictedAngle]);

  const activeColor = activeItem ? categoryColors[activeItem] : 'var(--text-muted)';
  const activeEmoji = activeItem ? categoryEmojis[activeItem] : '❓';

  // Define Bins mapping for bottom layout display
  const bins = [
    { id: 'organic', label: 'Organic', items: ['biological'], color: '#22c55e' },
    { id: 'recyclables', label: 'Recyclables', items: ['cardboard', 'paper', 'plastic', 'metal'], color: '#0ea5e9' },
    { id: 'glass', label: 'Glass bank', items: ['white-glass', 'brown-glass', 'green-glass'], color: '#14b8a6' },
    { id: 'textiles', label: 'Textiles', items: ['clothes', 'shoes'], color: '#a855f7' },
    { id: 'hazardous', label: 'Hazardous', items: ['battery'], color: '#ef4444' },
    { id: 'landfill', label: 'Landfill', items: ['trash'], color: '#64748b' }
  ];

  return (
    <div className="glass-card animate-fade-in" style={{
      padding: '1.5rem',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} color="var(--color-primary)" />
            Segregation Mechanism Simulator
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Simulating microcontroller, conveyor belt, and servo gate response.
          </span>
        </div>
        <div style={{
          padding: '0.3rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: sortingState !== 'idle' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          color: sortingState !== 'idle' ? 'var(--color-primary)' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          textTransform: 'uppercase'
        }}>
          {sortingState !== 'idle' && <RefreshCw size={12} className="spin-icon" />}
          Status: {sortingState}
        </div>
      </div>

      {/* Main Conveyor Layout */}
      <div style={{
        position: 'relative',
        height: '200px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem'
      }}>
        {/* Conveyor Tracks */}
        <div style={{
          position: 'absolute',
          left: '5%',
          right: '5%',
          height: '24px',
          background: 'repeating-linear-gradient(45deg, #1e293b, #1e293b 10px, #0f172a 10px, #0f172a 20px)',
          borderRadius: '12px',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)',
          border: '2px solid #334155',
          animation: sortingState === 'moving' ? 'belt-flow 0.5s linear infinite' : 'none',
          top: '55%'
        }} />

        {/* Servo Gate Motor Visual */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '25%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 5
        }}>
          {/* Dial indicator */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#1e293b',
            border: '3px solid #475569',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}>
            {/* Degree marks */}
            <div style={{ fontSize: '0.6rem', position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)' }}>0°</div>
            <div style={{ fontSize: '0.6rem', position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>90°</div>
            <div style={{ fontSize: '0.6rem', position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)' }}>180°</div>
            
            {/* Servo Pointer Needle */}
            <div style={{
              position: 'absolute',
              width: '4px',
              height: '26px',
              background: activeColor,
              top: '50%',
              left: 'calc(50% - 2px)',
              transformOrigin: '50% 0%',
              transform: `rotate(${servoRotation}deg)`,
              transition: 'transform 0.5s ease-out, background-color 0.3s',
              borderRadius: '2px'
            }} />
            
            {/* Cap */}
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }} />
          </div>
          <span style={{ fontSize: '0.65rem', marginTop: '0.25rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            SERVO: {servoRotation}°
          </span>
        </div>

        {/* Sliding Waste Item */}
        {sortingState !== 'idle' && (
          <div style={{
            position: 'absolute',
            left: `calc(5% + (${position}% * 0.85))`,
            top: position > 90 ? '75%' : '42%',
            transform: 'translate(-50%, -50%)',
            transition: position > 90 ? 'top 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 0.4s' : 'none',
            zIndex: 10,
            opacity: position > 98 ? 0 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.95)',
              border: `1px solid ${activeColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              animation: sortingState === 'moving' ? 'pulse 1.5s infinite' : 'none'
            }}>
              {activeEmoji}
            </div>
            <span style={{
              fontSize: '0.65rem',
              background: '#0f172a',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              border: '1px solid var(--border-glass)',
              color: 'white',
              whiteSpace: 'nowrap'
            }}>
              {categoryLabels[activeItem] || activeItem}
            </span>
          </div>
        )}

        {/* Start point label */}
        <div style={{
          position: 'absolute',
          left: '5%',
          top: '32%',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span>Entry Point</span>
          <span>⬇️</span>
        </div>

        {/* Sorting Gate label */}
        <div style={{
          position: 'absolute',
          left: '46%',
          top: '75%',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>
          Gate Sensor
        </div>

        {/* Destination point label */}
        <div style={{
          position: 'absolute',
          right: '5%',
          top: '32%',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span>Segregate</span>
          <span>⬇️</span>
        </div>
      </div>

      {/* Sorting Bins Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '0.5rem',
        marginTop: '0.5rem'
      }}>
        {bins.map((bin) => {
          const isTarget = activeItem && bin.items.includes(activeItem);
          const hasDropped = selectedBin && bin.items.includes(selectedBin);
          return (
            <div
              key={bin.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: isTarget 
                  ? `2px solid ${bin.color}` 
                  : '1.5px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                textAlign: 'center',
                transition: 'all 0.3s',
                transform: hasDropped ? 'scale(1.05)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: `${bin.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                color: bin.color
              }}>
                🗑️
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>{bin.label}</span>
              
              {/* Items matching this container */}
              <div style={{ 
                fontSize: '0.6rem', 
                color: 'var(--text-muted)',
                lineHeight: 1.1,
                marginTop: '0.25rem'
              }}>
                {bin.items.map(i => i.split('-')[0]).join(', ')}
              </div>

              {/* Bounce effect drop indicator */}
              {hasDropped && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  background: bin.color,
                  color: '#0b0f19',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  animation: 'drop-bounce 0.6s ease-out'
                }}>
                  {categoryEmojis[selectedBin]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .spin-icon {
          animation: spin 2s linear infinite;
        }
        @keyframes drop-bounce {
          0% { transform: translateY(-40px) scale(0.6); opacity: 0; }
          50% { transform: translateY(0px) scale(1.1); opacity: 1; }
          75% { transform: translateY(-10px) scale(0.9); }
          100% { transform: translateY(0px) scale(1); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default ConveyorBelt;
