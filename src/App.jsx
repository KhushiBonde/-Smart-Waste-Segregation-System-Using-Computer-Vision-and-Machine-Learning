import React, { useState, useEffect } from 'react';
import { 
  Recycle, 
  LayoutDashboard, 
  Camera, 
  BookOpen, 
  BarChart3, 
  Cpu, 
  Wifi, 
  WifiOff,
  LogOut
} from 'lucide-react';

// View Imports
import Dashboard from './components/Dashboard';
import RealTimeSort from './components/RealTimeSort';
import Guide from './components/Guide';
import Analytics from './components/Analytics';
import HardwareConfig from './components/HardwareConfig';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ecosort_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const savedUser = localStorage.getItem('ecosort_user');
    return savedUser ? 'dashboard' : 'landing';
  });

  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'

  // Dynamic config options stored locally
  const [hardwareConfig, setHardwareConfig] = useState({
    port: 'COM3',
    baudRate: 9600,
    connectionSimulated: true,
  });

  // Verify backend connectivity
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/guide');
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('ecosort_user', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ecosort_user');
    setActiveTab('landing');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard hardwareConfig={hardwareConfig} />;
      case 'realtime':
        return <RealTimeSort hardwareConfig={hardwareConfig} />;
      case 'guide':
        return <Guide />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <HardwareConfig config={hardwareConfig} setConfig={setHardwareConfig} />;
      default:
        return <Dashboard hardwareConfig={hardwareConfig} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'realtime', label: 'Real-Time Sort', icon: Camera },
    { id: 'guide', label: 'Waste Guide', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Hardware Config', icon: Cpu },
  ];

  // Guest layout
  if (!user) {
    if (activeTab === 'login') {
      return (
        <Auth 
          onLoginSuccess={handleLoginSuccess} 
          onBackToLanding={() => setActiveTab('landing')} 
        />
      );
    }
    return (
      <LandingPage 
        onLaunch={() => setActiveTab('login')} 
        onAuth={setActiveTab} 
        isAuthenticated={false} 
      />
    );
  }

  // Authenticated layout
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          {/* App Logo */}
          <div className="sidebar-header" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2.5rem',
            paddingLeft: '0.5rem'
          }}>
            <div style={{
              background: 'var(--color-primary)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Recycle size={20} color="#09090b" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.15rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.1
              }}>EcoSort AI</h1>
              <span style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Waste Segregation</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    width: '100%',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left'
                  }}
                  className={isActive ? '' : 'nav-btn-hover'}
                >
                  <Icon size={16} color={isActive ? 'var(--color-primary)' : 'var(--text-secondary)'} />
                  {item.label}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                width: '100%',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: '#fca5a5',
                fontFamily: 'var(--font-sans)',
                fontWeight: 400,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                marginTop: '0.5rem'
              }}
              className="nav-btn-hover-danger"
            >
              <LogOut size={16} color="#fca5a5" />
              Sign Out
            </button>
          </nav>
        </div>

        <div>
          {/* User Profile Badge */}
          <div className="profile-badge">
            <div className="profile-avatar">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="profile-details">
              <span className="profile-name">{user.name}</span>
              <span className="profile-role">{user.role}</span>
            </div>
          </div>

          {/* System & Connection Status Panel */}
          <div className="glass-card sidebar-status-card" style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {backendStatus === 'connected' ? (
                <Wifi size={14} color="var(--color-primary)" />
              ) : backendStatus === 'offline' ? (
                <WifiOff size={14} color="#ef4444" />
              ) : (
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '2px solid var(--text-muted)',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              <span style={{ fontWeight: 500 }}>System Backend</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              {backendStatus === 'connected' ? (
                <span style={{ color: 'var(--color-primary)' }}>Online & Ready</span>
              ) : backendStatus === 'offline' ? (
                <span style={{ color: '#ef4444' }}>Offline (Port 8000)</span>
              ) : (
                <span>Checking...</span>
              )}
            </div>
            <div style={{ 
              marginTop: '0.75rem', 
              fontSize: '0.7rem', 
              color: 'var(--text-muted)', 
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.5rem'
            }}>
              Proto v1.0.0 (CNN Core)
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Embedded CSS for sidebar hover */}
      <style>{`
        .nav-btn-hover:hover {
          background: var(--bg-tertiary) !important;
          color: white !important;
          opacity: 0.8;
        }
        .nav-btn-hover-danger:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #ef4444 !important;
          opacity: 0.9;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
