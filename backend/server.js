// ai-layout-project/backend/server.js

import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch'; 
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Configure Gemini API ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("GEMINI_API_KEY not found in .env file. Please set it.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- Configure Google Custom Search API ---
const googleSearchAPIKey = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

if (!googleSearchAPIKey || !GOOGLE_CSE_ID) {
    console.warn("Google Custom Search API keys not fully configured. Google search results will be skipped.");
}

// Helper function to fetch results from Google Custom Search
async function getGoogleSearchResults(query) {
    if (!googleSearchAPIKey || !GOOGLE_CSE_ID) {
        return { images: [], links: [] }; // Return empty if keys are missing
    }

    const encodedQuery = encodeURIComponent(query);
    const imageSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleSearchAPIKey}&cx=${GOOGLE_CSE_ID}&q=${encodedQuery}&searchType=image&num=4`; // Fetch up to 4 images
    const webSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleSearchAPIKey}&cx=${GOOGLE_CSE_ID}&q=${encodedQuery}&num=3`; // Fetch up to 3 web links

    let googleImages = [];
    let googleLinks = [];

    try {
        // Fetch Images
        const imageRes = await fetch(imageSearchUrl);
        const imageData = await imageRes.json();
        if (imageData.items) {
            googleImages = imageData.items.map(item => ({
                src: item.link, 
                alt: item.title || "Google Search Image"
            }));
        }
    } catch (error) {
        console.error("Error fetching images from Google Custom Search API:", error);
    }

    try {
        // Fetch Web Links
        const webRes = await fetch(webSearchUrl);
        const webData = await webRes.json();
        if (webData.items) {
            googleLinks = webData.items.map(item => ({
                title: item.title,
                url: item.link,
                snippet: item.snippet
            }));
        }
    } catch (error) {
        console.error("Error fetching web links from Google Custom Search API:", error);
    }
    return { images: googleImages, links: googleLinks };
}

// API endpoint for search
app.post('/api/search', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: "Query is required." });
    }

    try {
        const geminiResult = await geminiModel.generateContent(`Answer the query "${query}" comprehensively and professionally in Markdown format. Use bolding, lists, and clear paragraphs. If providing facts, cite them as [1], [2] etc. where appropriate.`);
        const geminiResponse = await geminiResult.response;
        const geminiText = geminiResponse.text();

        // --- Step 2: Get Images and Links from Google Custom Search ---
        const { images: googleImages, links: googleLinks } = await getGoogleSearchResults(query);
        console.log(`Fetched ${googleImages.length} images and ${googleLinks.length} links from Google.`);

        // --- Step 3: Format and Send Combined Response to Frontend ---
        const paragraphs = geminiText.split('\n\n').filter(p => p.trim() !== '');

        let videoThumbnail = null;
        // Example: If query is "onlyfans", provide a placeholder video thumbnail
        if (query.toLowerCase().includes("onlyfans")) {
            videoThumbnail = {
                src: "https://via.placeholder.com/400x225?text=OnlyFans+Video+Placeholder",
                alt: "OnlyFans Video Thumbnail"
            };
        }

        const responseData = {
            answer: {
                paragraphs: paragraphs,
                videoThumbnail: videoThumbnail
            },
            images: googleImages, 
            socialHandles: [{ icon: "faInstagram" }], 
            googleLinks: googleLinks 
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error in API search endpoint:", error);
        res.status(500).json({ error: "Failed to get response from AI model or Google Search. Please try again." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});