import { useState } from 'react'
import './index.css'
import AuthScreen from './components/AuthScreen.jsx'
import Sidebar from './components/Sidebar.jsx'
import ChatBox from './components/ChatBox.jsx'
import PulseLine from './components/Pulsline.jsx'
import { API_BASE } from './config.js'

function App() {
  const [user, setUser] = useState(null)
  const [documents, setDocuments] = useState([])

  const handleAuthSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      // logout failing shouldn't trap the user on the dashboard
    }
    setUser(null)
    setDocuments([])
  }

  const handleUploadSuccess = (docMeta) => {
    setDocuments(prev => [...prev, docMeta])
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="app-shell">
      <header style={styles.header}>
        <div className="container-max" style={styles.headerInner}>
          <div style={styles.brandRow}>
            <span style={styles.brandMark}>MediAssist AI</span>
            <div style={styles.statusDot}>
              <span style={styles.dot} />
              System online
            </div>
          </div>

          <div style={styles.userRow}>
            <span className={`badge ${user.role === 'doctor' ? 'badge-coral' : ''}`}>
              {user.role === 'doctor' ? 'Doctor' : 'Patient'}
            </span>
            <span style={styles.userName}>{user.name}</span>
            <button onClick={handleLogout} className="btn btn-ghost">Log out</button>
          </div>
        </div>
        <PulseLine size="sm" color="#DCE8E6" />
      </header>

      <main className="container-max dashboard-grid">
        <div className="card dashboard-panel">
          <Sidebar documents={documents} onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="card dashboard-panel">
          <ChatBox user={user} hasDocuments={documents.length > 0} />
        </div>
      </main>
    </div>
  )
}

const styles = {
  header: {
    background: 'var(--white)',
    borderBottom: '1px solid var(--line)',
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    padding: '0.9rem 0',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  brandMark: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '1.2rem',
    color: 'var(--teal-strong)',
  },
  statusDot: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    color: 'var(--ink-faint)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#3FA487',
    display: 'inline-block',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
  },
  userName: {
    fontSize: '0.88rem',
    color: 'var(--ink-soft)',
    fontWeight: 500,
  },
}

export default App