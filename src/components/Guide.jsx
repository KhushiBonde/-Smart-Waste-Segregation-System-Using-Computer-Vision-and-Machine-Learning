import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Settings, AlertCircle, Compass } from 'lucide-react';

const categoryEmojis = {
  battery: '🔋',
  biological: '🍏',
  'brown-glass': '🟫🍾',
  cardboard: '📦',
  clothes: '👕',
  'green-glass': '🟩🍾',
  metal: '🥫',
  paper: '📄',
  plastic: '🧴',
  shoes: '👟',
  trash: '🗑️',
  'white-glass': '⬜🍾'
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
  'white-glass': '#f1f5f9'
};

function Guide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback category guide in case backend is offline
  const fallbackCategories = [
    { id: 'battery', name: 'Battery', suggestion: 'Recycle batteries at designated hazardous collection points. Do not place in ordinary household waste bins.', angle: 15, carbon: 0.12 },
    { id: 'biological', name: 'Biological', suggestion: 'Compost organic and food waste. Composting helps reduce landfill volume and generates nutritious soil.', angle: 45, carbon: 0.25 },
    { id: 'brown-glass', name: 'Brown glass', suggestion: 'Clean out contents and deposit in brown glass bottle bank containers.', angle: 75, carbon: 0.35 },
    { id: 'cardboard', name: 'Cardboard', suggestion: 'Flatten and place in dry recycling containers. Remove shipping tape or plastic inserts.', angle: 105, carbon: 0.48 },
    { id: 'clothes', name: 'Clothes', suggestion: 'Donate wearable apparel to charitable initiatives. Recycle damaged textiles at recycling collection points.', angle: 135, carbon: 0.75 },
    { id: 'green-glass', name: 'Green glass', suggestion: 'Clean out and place in green glass bottle bank containers.', angle: 165, carbon: 0.35 },
    { id: 'metal', name: 'Metal', suggestion: 'Recycle aluminum cans and clean metal containers. Place in dry recycling containers.', angle: 195, carbon: 1.45 },
    { id: 'paper', name: 'Paper', suggestion: 'Place clean paper and newspapers in dry recycling containers. Shred sensitive files.', angle: 225, carbon: 0.52 },
    { id: 'plastic', name: 'Plastic', suggestion: 'Clean and rinse plastic bottles and packaging. Check classification codes and recycle accordingly.', angle: 255, carbon: 0.88 },
    { id: 'shoes', name: 'Shoes', suggestion: 'Donate shoes in good shape to charities. Damaged shoes go to specialized textile centers.', angle: 285, carbon: 0.60 },
    { id: 'trash', name: 'Trash', suggestion: 'Dispose of in household waste bins. Focus on reduction, composting, and proper sorting to minimize this container.', angle: 315, carbon: 0.0 },
    { id: 'white-glass', name: 'White glass', suggestion: 'Clean out contents and deposit in clear/white glass bottle bank containers.', angle: 345, carbon: 0.35 }
  ];

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await fetch('/api/guide');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.warn("Backend offline, loading fallback guide data.");
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slide-in 0.4s ease' }}>
      
      {/* Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} color="var(--color-primary)" />
            Disposal Guide & Database
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Look up details about the 12 sorting categories used by the CNN core model.
          </p>
        </div>

        {/* Custom Search bar */}
        <div className="glass-panel" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          width: '320px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search categories (e.g. plastic, metal)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {loading ? (
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
      ) : (
        /* Guide Grid Cards */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredCategories.map((cat) => {
            const color = categoryColors[cat.id] || 'white';
            const emoji = categoryEmojis[cat.id] || '❓';
            return (
              <div 
                key={cat.id} 
                className="glass-card" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderTop: `3px solid ${color}`,
                  justifyContent: 'space-between'
                }}
              >
                {/* Upper Details */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1rem'
                  }}>
                    {cat.suggestion}
                  </p>
                </div>

                {/* Footer attributes */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Compass size={12} color={color} />
                    <span>Servo: <strong style={{ color: 'white' }}>{cat.angle}°</strong></span>
                  </div>
                  <div>
                    <span>CO₂ Saving: <strong style={{ color: 'var(--color-primary)' }}>{cat.carbon} kg/item</strong></span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="glass-panel" style={{
              gridColumn: '1 / -1',
              padding: '3rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--text-secondary)'
            }}>
              <AlertCircle size={36} color="var(--text-muted)" />
              <div>
                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>No Categories Match Search</h4>
                <p style={{ fontSize: '0.85rem' }}>Try looking up base words like "glass", "paper", or "plastic".</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Guide;
