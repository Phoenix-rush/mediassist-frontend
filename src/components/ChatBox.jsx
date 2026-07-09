import React, { useEffect, useRef, useState } from 'react'
import PulseLine from './Pulsline.jsx'
import { API_BASE } from '../config.js'

const ChatBox = ({ user, hasDocuments }) => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async (e) => {
        e.preventDefault()
        const question = input.trim()
        if (!question || isLoading) return

        setMessages(prev => [...prev, { role: 'user', text: question }])
        setInput('')
        setIsLoading(true)
        setMessages(prev => [...prev, { role: 'ai', text: '' }])

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            })

            if (!response.ok || !response.body) {
                const fallback = await response.json().catch(() => null)
                throw new Error(fallback?.message || 'The assistant could not respond.')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder('utf-8')
            let aiText = ''
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const events = buffer.split('\n\n')
                buffer = events.pop() // keep any incomplete trailing chunk for next read

                for (const evt of events) {
                    if (!evt.startsWith('data: ')) continue
                    const dataStr = evt.replace('data: ', '').trim()
                    if (!dataStr) continue

                    try {
                        const parsed = JSON.parse(dataStr)
                        if (parsed.text) {
                            aiText += parsed.text
                            setMessages(prev => {
                                const next = [...prev]
                                next[next.length - 1] = { role: 'ai', text: aiText }
                                return next
                            })
                        }
                        if (parsed.error) {
                            throw new Error(parsed.error)
                        }
                    } catch (parseErr) {
                        // ignore malformed fragments, keep streaming
                    }
                }
            }
        } catch (err) {
            setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { role: 'ai', text: '', error: err.message || 'Something went wrong.' }
                return next
            })
        } finally {
            setIsLoading(false)
        }
    }

    const placeholder = user?.role === 'doctor'
        ? 'Ask for a clinical summary, flagged values, or differentials…'
        : 'Ask what a result means, in plain language…'

    return (
        <div style={styles.panel}>
            <div style={styles.header}>
                <span className="badge badge-coral">Consult</span>
                <h3 style={styles.title}>Ask about your report</h3>
            </div>

            <div ref={scrollRef} style={styles.thread}>
                {messages.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyTitle}>
                            {hasDocuments ? 'Ready when you are' : 'Upload a report to begin'}
                        </p>
                        <p style={styles.emptyBody}>
                            {hasDocuments
                                ? 'Try asking something like "What is my cholesterol level?" or "Summarize this report."'
                                : 'Once a report is indexed on the left, you can ask questions about it here.'}
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className="msg-in"
                            style={msg.role === 'user' ? styles.bubbleUserWrap : styles.bubbleAiWrap}
                        >
                            <div style={msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}>
                                {msg.error ? (
                                    <span style={styles.errorText}>{msg.error}</span>
                                ) : msg.text ? (
                                    msg.text
                                ) : (
                                    <div style={styles.thinking}>
                                        <PulseLine size="sm" color="#1F7A73" />
                                        <span style={styles.thinkingText}>Reading the report…</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={sendMessage} style={styles.form}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="field-input"
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={isLoading || !input.trim()}>
                    Send
                </button>
            </form>
        </div>
    )
}

const styles = {
    panel: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.25rem',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '1rem',
    },
    title: { fontSize: '1.05rem' },
    thread: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem',
        paddingRight: '0.25rem',
    },
    bubbleUserWrap: { display: 'flex', justifyContent: 'flex-end' },
    bubbleAiWrap: { display: 'flex', justifyContent: 'flex-start' },
    bubbleUser: {
        maxWidth: '78%',
        background: 'var(--teal)',
        color: '#FFFFFF',
        padding: '0.65rem 0.9rem',
        borderRadius: '14px 14px 4px 14px',
        fontSize: '0.92rem',
        lineHeight: 1.5,
    },
    bubbleAi: {
        maxWidth: '78%',
        background: 'var(--white)',
        color: 'var(--ink)',
        padding: '0.7rem 0.95rem',
        borderRadius: '4px 14px 14px 14px',
        fontSize: '0.92rem',
        lineHeight: 1.6,
        borderLeft: '3px solid var(--sea)',
        boxShadow: '0 1px 2px rgba(18,38,42,0.06)',
        whiteSpace: 'pre-wrap',
    },
    thinking: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: 140,
    },
    thinkingText: {
        fontSize: '0.82rem',
        color: 'var(--ink-faint)',
        fontFamily: 'var(--font-mono)',
    },
    errorText: {
        color: 'var(--coral-strong)',
        fontSize: '0.88rem',
    },
    form: {
        display: 'flex',
        gap: '0.6rem',
        marginTop: '0.9rem',
    },
    emptyState: {
        margin: 'auto',
        textAlign: 'center',
        maxWidth: 320,
    },
    emptyTitle: {
        fontWeight: 600,
        fontSize: '0.95rem',
        margin: '0 0 0.35rem 0',
        color: 'var(--ink)',
    },
    emptyBody: {
        fontSize: '0.85rem',
        color: 'var(--ink-faint)',
        margin: 0,
        lineHeight: 1.55,
    },
}

export default ChatBox