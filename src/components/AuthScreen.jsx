import React, { useState } from 'react'
import PulseLine from './Pulsline.jsx'
import { API_BASE } from '../config.js'

const AuthScreen = ({ onAuthSuccess }) => {
    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('patient')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const switchMode = (next) => {
        setMode(next)
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
        const payload = mode === 'login'
            ? { email, password }
            : { name, email, password, role }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await response.json()

            if (data.success) {
                onAuthSuccess(data.data)
            } else {
                setError(data.message || 'Something went wrong. Please try again.')
            }
        } catch (err) {
            setError('Could not reach the server. Is the backend running?')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div style={styles.wrap}>
            {/* Left identity panel */}
            <div style={styles.brandPanel}>
                <div style={styles.brandTop}>
                    <span style={styles.brandMark}>MediAssist AI</span>
                    <p style={styles.brandTagline}>Your reports, explained clearly.</p>
                </div>

                <div style={styles.pulseZone}>
                    <PulseLine size="lg" color="#E8604A" />
                </div>

                <p style={styles.brandFooter}>
                    Upload a lab report or scan. Ask questions in plain language.
                    Get answers grounded only in what your report actually says —
                    nothing invented, nothing assumed.
                </p>
            </div>

            {/* Right form panel */}
            <div style={styles.formPanel}>
                <div style={styles.formCard}>
                    <div style={styles.tabRow}>
                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            style={mode === 'login' ? styles.tabActive : styles.tab}
                        >
                            Log in
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('register')}
                            style={mode === 'register' ? styles.tabActive : styles.tab}
                        >
                            Create account
                        </button>
                    </div>

                    <h2 style={styles.formTitle}>
                        {mode === 'login' ? 'Welcome back' : 'Set up your account'}
                    </h2>
                    <p style={styles.formSubtitle}>
                        {mode === 'login'
                            ? 'Log in to continue your consultation.'
                            : 'It takes under a minute.'}
                    </p>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {mode === 'register' && (
                            <div>
                                <label className="field-label" htmlFor="name">Full name</label>
                                <input
                                    id="name"
                                    className="field-input"
                                    type="text"
                                    placeholder="Rohan Mehta"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label className="field-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                className="field-input"
                                type="email"
                                placeholder="you@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="field-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                className="field-input"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label className="field-label">I am signing up as a</label>
                                <div style={styles.roleRow}>
                                    <button
                                        type="button"
                                        onClick={() => setRole('patient')}
                                        style={role === 'patient' ? styles.rolePillActive : styles.rolePill}
                                    >
                                        Patient
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('doctor')}
                                        style={role === 'doctor' ? styles.rolePillActive : styles.rolePill}
                                    >
                                        Doctor
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && <p style={styles.error}>{error}</p>}

                        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '0.4rem' }}>
                            {isLoading
                                ? (mode === 'login' ? 'Logging in…' : 'Creating account…')
                                : (mode === 'login' ? 'Log in' : 'Create account')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

const styles = {
    wrap: {
        minHeight: '100vh',
        display: 'flex',
        flexWrap: 'wrap',
    },
    brandPanel: {
        flex: '1 1 380px',
        minWidth: 320,
        background: 'linear-gradient(165deg, #0B3B38, #12524E 60%)',
        color: '#EAF3F1',
        padding: '3rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '2rem',
    },
    brandTop: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    brandMark: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '1.6rem',
        color: '#FFFFFF',
        letterSpacing: '0.01em',
    },
    brandTagline: {
        fontFamily: 'var(--font-body)',
        color: '#B9D4CF',
        fontSize: '1rem',
        margin: 0,
    },
    pulseZone: {
        opacity: 0.9,
    },
    brandFooter: {
        fontFamily: 'var(--font-body)',
        fontSize: '0.92rem',
        lineHeight: 1.6,
        color: '#CBE2DE',
        maxWidth: 380,
        margin: 0,
    },
    formPanel: {
        flex: '1 1 420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        background: 'var(--paper)',
    },
    formCard: {
        width: '100%',
        maxWidth: 400,
    },
    tabRow: {
        display: 'flex',
        gap: '0.4rem',
        background: 'var(--mist)',
        borderRadius: 10,
        padding: 4,
        marginBottom: '1.6rem',
    },
    tab: {
        flex: 1,
        border: 'none',
        background: 'transparent',
        padding: '0.55rem 0.5rem',
        borderRadius: 8,
        fontSize: '0.88rem',
        fontWeight: 600,
        color: 'var(--ink-soft)',
    },
    tabActive: {
        flex: 1,
        border: 'none',
        background: 'var(--white)',
        padding: '0.55rem 0.5rem',
        borderRadius: 8,
        fontSize: '0.88rem',
        fontWeight: 600,
        color: 'var(--teal-strong)',
        boxShadow: '0 1px 3px rgba(18,38,42,0.12)',
    },
    formTitle: {
        fontSize: '1.5rem',
        marginBottom: '0.3rem',
    },
    formSubtitle: {
        color: 'var(--ink-soft)',
        fontSize: '0.92rem',
        margin: '0 0 1.5rem 0',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    roleRow: {
        display: 'flex',
        gap: '0.6rem',
    },
    rolePill: {
        flex: 1,
        padding: '0.6rem',
        borderRadius: 10,
        border: '1.5px solid var(--line)',
        background: 'var(--white)',
        color: 'var(--ink-soft)',
        fontWeight: 600,
        fontSize: '0.88rem',
    },
    rolePillActive: {
        flex: 1,
        padding: '0.6rem',
        borderRadius: 10,
        border: '1.5px solid var(--teal)',
        background: 'var(--teal)',
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize: '0.88rem',
    },
    error: {
        color: 'var(--coral-strong)',
        background: 'var(--coral-soft)',
        padding: '0.6rem 0.75rem',
        borderRadius: 8,
        fontSize: '0.85rem',
        margin: 0,
    },
}

export default AuthScreen