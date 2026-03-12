const hexToRgb = (hex?: string | null) => {
    if (!hex) return { r: 0, g: 200, b: 255 } // fallback

    let clean = hex.replace('#', '')
    if (clean.length === 3) {
        clean = clean
            .split('')
            .map((c) => c + c)
            .join('')
    }

    const num = parseInt(clean, 16)
    const r = (num >> 16) & 255
    const g = (num >> 8) & 255
    const b = num & 255

    return { r, g, b }
}

export const getAuroraBackground = (colorHex?: string | null) => {
    const { r, g, b } = hexToRgb(colorHex)

    return {
        backgroundImage: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.25) 0%, rgba(10, 10, 12, 0) 50%)`,
        backgroundColor: '#050509',
    } as const
}