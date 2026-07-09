import React, { useRef, useState } from 'react'
import { API_BASE } from '../config.js'
// Strips the "<timestamp>-" prefix multer adds, so the list reads cleanly.
const cleanFilename = (filename) => filename.replace(/^\d+-/, '')

const Sidebar = ({ documents, onUploadSuccess }) => {
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState({ type: 'idle', message: '' })
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        setFile(e.target.files[0] || null)
        setStatus({ type: 'idle', message: '' })
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!file) {
            setStatus({ type: 'error', message: 'Choose a file first.' })
            return
        }

        setIsLoading(true)
        setStatus({ type: 'pending', message: 'Reading and indexing the report…' })

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch(`${API_BASE}/documents/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            const data = await response.json()

            if (data.success) {
                setStatus({ type: 'success', message: 'Report indexed. Ready for questions.' })
                onUploadSuccess({
                    filename: data.data.filename,
                    totalChunks: data.data.totalChunks,
                    size: data.data.size,
                })
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
            } else {
                setStatus({ type: 'error', message: data.message || 'Upload failed.' })
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Could not reach the server.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div style={styles.panel}>
            <div style={styles.header}>
                <span className="badge">Chart</span>
                <h3 style={styles.title}>Reports</h3>
            </div>

            <form onSubmit={handleUpload} style={styles.uploadForm}>
                <label htmlFor="report-file" style={styles.dropzone}>
                    <span style={styles.dropzoneIcon}>+</span>
                    <span style={styles.dropzoneText}>
                        {file ? file.name : 'Click to choose a PDF or image'}
                    </span>
                </label>
                <input
                    id="report-file"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <button type="submit" className="btn btn-accent" disabled={isLoading} style={{ width: '100%' }}>
                    {isLoading ? 'Indexing…' : 'Upload report'}
                </button>

                {status.message && (
                    <p style={status.type === 'error' ? styles.statusError : styles.statusOk}>
                        {status.message}
                    </p>
                )}
            </form>

            <div style={styles.divider} />

            <div style={styles.list}>
                {documents.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyTitle}>No reports yet</p>
                        <p style={styles.emptyBody}>
                            Upload a report above to start asking questions about it.
                        </p>
                    </div>
                ) : (
                    documents.map((doc, idx) => (
                        <div key={idx} style={styles.docRow}>
                            <div style={styles.docDot} />
                            <div style={{ minWidth: 0 }}>
                                <p style={styles.docName}>{cleanFilename(doc.filename)}</p>
                                <p style={styles.docMeta}>{doc.totalChunks} chunks · {doc.size}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
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
    title: {
        fontSize: '1.05rem',
    },
    uploadForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem',
    },
    dropzone: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        border: '1.5px dashed var(--line)',
        borderRadius: 'var(--radius-sm)',
        padding: '1.4rem 1rem',
        cursor: 'pointer',
        background: 'var(--paper-soft)',
        textAlign: 'center',
    },
    dropzoneIcon: {
        fontSize: '1.4rem',
        color: 'var(--sea)',
        fontWeight: 600,
        lineHeight: 1,
    },
    dropzoneText: {
        fontSize: '0.82rem',
        color: 'var(--ink-soft)',
        wordBreak: 'break-word',
    },
    statusOk: {
        fontSize: '0.82rem',
        color: 'var(--teal-strong)',
        margin: 0,
    },
    statusError: {
        fontSize: '0.82rem',
        color: 'var(--coral-strong)',
        margin: 0,
    },
    divider: {
        height: 1,
        background: 'var(--line)',
        margin: '1.25rem 0 1rem',
    },
    list: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
    },
    docRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
        padding: '0.6rem',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--paper-soft)',
    },
    docDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--sea)',
        marginTop: 6,
        flexShrink: 0,
    },
    docName: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--ink)',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    docMeta: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        color: 'var(--ink-faint)',
        margin: '0.15rem 0 0 0',
    },
    emptyState: {
        padding: '1.25rem 0.5rem',
        textAlign: 'center',
    },
    emptyTitle: {
        fontWeight: 600,
        fontSize: '0.9rem',
        margin: '0 0 0.3rem 0',
        color: 'var(--ink)',
    },
    emptyBody: {
        fontSize: '0.82rem',
        color: 'var(--ink-faint)',
        margin: 0,
        lineHeight: 1.5,
    },
}

export default Sidebar