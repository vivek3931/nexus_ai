import dotenv from 'dotenv';

dotenv.config();

// Wikimedia Commons API for images (free, no API key needed)
export const searchImages = async (query, count = 4) => {
    try {
        console.log('Searching images for:', query);

        // Use Wikimedia Commons search directly for better results
        const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${count * 3}&format=json&origin=*`;

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        const images = [];

        if (searchData.query?.search) {
            for (const item of searchData.query.search) {
                if (images.length >= count) break;

                // Skip SVG and small icons
                const title = item.title.toLowerCase();
                if (title.includes('.svg') || title.includes('icon') || title.includes('logo') || title.includes('flag')) {
                    continue;
                }

                // Get image info
                try {
                    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.title)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=400&format=json&origin=*`;
                    const infoResponse = await fetch(infoUrl);
                    const infoData = await infoResponse.json();

                    const pages = infoData.query?.pages;
                    if (pages) {
                        const page = Object.values(pages)[0];
                        if (page.imageinfo?.[0]?.url) {
                            const info = page.imageinfo[0];
                            images.push({
                                url: info.url,
                                title: item.title.replace('File:', '').replace(/\.[^.]+$/, ''),
                                thumbnail: info.thumburl || info.url,
                                source: 'Wikimedia Commons'
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error fetching image info:', err);
                }
            }
        }

        // Fallback: Try Wikipedia page images if Commons didn't return enough
        if (images.length < count) {
            try {
                const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(query)}&pithumbsize=400&pilimit=${count}&format=json&origin=*`;
                const wikiResponse = await fetch(wikiUrl);
                const wikiData = await wikiResponse.json();

                if (wikiData.query?.pages) {
                    for (const page of Object.values(wikiData.query.pages)) {
                        if (images.length >= count) break;
                        if (page.thumbnail?.source) {
                            images.push({
                                url: page.thumbnail.source,
                                title: page.title || 'Wikipedia Image',
                                thumbnail: page.thumbnail.source,
                                source: 'Wikipedia'
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Wikipedia fallback error:', err);
            }
        }

        console.log(`Found ${images.length} images`);
        return images;
    } catch (error) {
        console.error('Image Search error:', error);
        return [];
    }
};

// Web search using Google (if configured)
export const searchWeb = async (query, count = 5) => {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;

    if (!apiKey || !cseId) {
        console.warn('Google Search API not configured - returning empty results');
        return [];
    }

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${count}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            return data.items.map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                source: item.displayLink
            }));
        }

        return [];
    } catch (error) {
        console.error('Google Web Search error:', error);
        return [];
    }
};
