import React from 'react';
import { ArrowRight, Recycle, Trash2, Cpu } from 'lucide-react';

function LandingPage({ onLaunch, onAuth, isAuthenticated }) {
  return (
    <div style={{ position: 'relative', background: '#ffffff', minHeight: '100vh', width: '100%', color: '#1f2937' }}>
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="landing-logo" onClick={() => onAuth('landing')}>
          <Recycle size={22} style={{ color: '#10b981', strokeWidth: 2.5 }} />
          EcoSort <span>Services</span>
        </div>
        <div className="landing-nav-links">
          <span className="landing-nav-link" onClick={() => onAuth('landing')}>Services</span>
          <span className="landing-nav-link" onClick={() => onAuth('landing')}>Pricing</span>
          <span className="landing-nav-link" onClick={() => onAuth('landing')}>Contacts</span>
          <span className="landing-nav-link" onClick={() => onAuth('landing')}>All Blocks</span>
          <button 
            className="btn btn-secondary" 
            onClick={() => onAuth('login')}
            style={{ 
              padding: '0.4rem 0.85rem', 
              fontSize: '0.725rem', 
              marginLeft: '0.75rem', 
              background: '#f3f4f6', 
              color: '#374151', 
              borderColor: '#e5e7eb',
              borderRadius: '4px'
            }}
          >
            Admin Panel
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="redesign-hero">
        <div className="redesign-hero-grid" />
        <div className="hero-left animate-fade-in">
          <div className="hero-sublabel">
            Give us a call to get a quote today!
          </div>
          <h1 className="hero-title-large">
            Local Removal Service Company
          </h1>
          <p className="hero-desc-large">
            Our reliable services protect the environment while allowing your home or business to run like clockwork. Automatically classify, log, and segregate recyclable waste in real-time.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {isAuthenticated ? (
              <button className="btn btn-primary" onClick={onLaunch} style={{ padding: '0.75rem 1.75rem', gap: '0.5rem' }}>
                Open Console Dashboard
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => onAuth('login')} style={{ padding: '0.75rem 1.75rem', gap: '0.5rem' }}>
                  Launch Console
                  <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary" onClick={() => onAuth('login')} style={{ padding: '0.75rem 1.75rem', borderColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
        <div className="hero-right animate-fade-in">
          <img 
            src="/hero_recycling_bin.png" 
            alt="Smart Recycling Bin" 
            className="hero-bin-image"
          />
        </div>
      </section>

      {/* "Full Service" Capabilities Section */}
      <section className="full-service-section">
        <div className="service-header">
          <div className="service-sublabel">
            Full Service
          </div>
          <h2 className="service-title">
            Automated Segregation
          </h2>
          <p className="service-subtitle">
            Book junk removal for your home or business, including offices, retail locations, construction sites and more.
          </p>
        </div>

        <div className="service-cards-grid">
          <div className="service-outline-card">
            <div className="service-card-icon-circle">
              <Trash2 size={24} />
            </div>
            <h4>Trash removal</h4>
            <p>
              We do trash removal in a timely manner, so you won't have problems with sorting and environmental hazards.
            </p>
          </div>

          <div className="service-outline-card">
            <div className="service-card-icon-circle">
              <Cpu size={24} />
            </div>
            <h4>Junk removal</h4>
            <p>
              Our junk hauling service is based on how efficiently we can recycle materials using automated computer vision models.
            </p>
          </div>

          <div className="service-outline-card">
            <div className="service-card-icon-circle">
              <Recycle size={24} />
            </div>
            <h4>Recycle</h4>
            <p>
              We can recycle the waste at a top-soil recycling center. Track all carbon impact analytics metrics live.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem'
        }}>
          <div>
            © {new Date().getFullYear()} EcoSort Services. Built for Smart Waste Segregation.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Services</span>
            <span style={{ cursor: 'pointer' }}>Pricing</span>
            <span style={{ cursor: 'pointer' }}>Contacts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
