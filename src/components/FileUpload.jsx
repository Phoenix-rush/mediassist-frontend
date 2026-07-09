import React, { useState } from 'react'

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!file) {
            setStatus('Please select a file first')
            return
        }

        setIsLoading(true)
        setStatus('Uploading and vectorizing...')

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:5000/api/documents/upload', {
                method: 'POST',
                credentials: 'include',   // 👈 Authorization header ki jagah ye
                body: formData
            })
            const data = await response.json()
            if (data.success) {
                setStatus('✅ File Processed Successfully!');
                if (onUploadSuccess) onUploadSuccess(data.data.filename);
            } else {
                setStatus(`❌ Error: ${data.message}`);
            }

        } catch (error) {
            setStatus('❌ Failed to connect to server.');
        }
        finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm mb-4">
            <h2 className="text-xl font-bold mb-2">Upload Medical Report</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border p-2 rounded" />
                <button type="submit" disabled={isLoading} className="bg-green-600 text-white py-2 rounded-lg">
                    {isLoading ? 'Processing...' : 'Upload Report'}
                </button>
                {status && <p className="text-sm mt-1">{status}</p>}
            </form>
        </div>
    )
}

export default FileUpload