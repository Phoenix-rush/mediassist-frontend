import React from 'react'

// One ECG-style waveform tile. Two are placed side by side and scrolled
// via CSS (see .pulse-track in index.css) to create a seamless monitor-tape loop.
const WaveTile = ({ color, width, height }) => (
    <svg width={width} height={height} viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M0,30 L60,30 L80,30 L95,8 L110,52 L125,20 L140,30 L200,30 L220,30 L235,10 L250,50 L265,18 L280,30 L400,30"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

/**
 * size: 'sm' (chat loading indicator) | 'md' (header) | 'lg' (auth panel)
 * color: any CSS color string
 */
const PulseLine = ({ size = 'md', color = '#E8604A' }) => {
    const heights = { sm: 20, md: 32, lg: 48 }
    const height = heights[size] || 32
    const width = height * (400 / 60)

    return (
        <div className="pulse-wrap" style={{ height }}>
            <div className="pulse-track">
                <WaveTile color={color} width={width} height={height} />
                <WaveTile color={color} width={width} height={height} />
            </div>
        </div>
    )
}

export default PulseLine