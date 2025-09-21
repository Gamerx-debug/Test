// api/search/songs.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { query = 'popular', limit = 20 } = req.query;
    const apiUrl = `https://annonymous-sage.vercel.app/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();

        const songs = (data.data?.results || []).slice(0, parseInt(limit)).map(song => ({
            title: song.name || 'Unknown Title',
            artist: song.artists?.primary?.[0]?.name || 'Unknown Artist',
            singers: song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown',
            image: song.image?.find(img => img.quality === '500x500')?.url || song.image?.[2]?.url || 'https://via.placeholder.com/150?text=Song',
            media_url: song.downloadUrl?.find(dl => dl.quality === '320kbps')?.url || song.downloadUrl?.[4]?.url || '',
            duration: song.duration || 0,
            album: song.album?.name || ''
        }));

        res.status(200).json({ success: true, data: { songs } });
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch songs' });
    }
}