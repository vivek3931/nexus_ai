// ai-layout-project/backend/server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fetch from 'node-fetch'; // Make sure node-fetch is installed if you're not using built-in fetch (Node 18+)
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

const app = express();
const port = process.env.PORT || 5000;

// --- Connect Database ---
connectDB();

const allowedOrigins = [
  'http://localhost:5173', // Your frontend development server
  'https://nexus-aibot.netlify.app' // Your deployed Netlify frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests) or if the origin is in our allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If you're using cookies or authorization headers
  optionsSuccessStatus: 200 // Some older browsers (IE11, various SmartTVs) choke on 204
};


// Middleware
app.use(cors(corsOptions));
app.use(express.json({ extended: false, limit: '50mb' }));

// --- Configure Gemini API ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("GEMINI_API_KEY not found in .env file. Please set it.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Safety settings for Gemini API
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];


// --- Configure Google Custom Search API ---
const googleSearchAPIKey = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

if (!googleSearchAPIKey || !GOOGLE_CSE_ID) {
    console.warn("Google Custom Search API keys not fully configured. Google search results will be skipped.");
    console.warn(`Google Search_API_KEY: ${googleSearchAPIKey ? googleSearchAPIKey.substring(0, 5) + '...' : 'Not Set'}`);
    console.warn(`GOOGLE_CSE_ID: ${GOOGLE_CSE_ID || 'Not Set'}`);
}

// --- Configure OneCompiler API ---
const oneCompilerApiKey = process.env.ONECOMPILER_API_KEY;
if (!oneCompilerApiKey) {
    console.warn("ONECOMPILER_API_KEY not found in .env file. Code compilation will not work.");
}

// Helper function to check if query contains code-related terms
const isCodeRelatedQuery = (query) => {
    if (!query || typeof query !== 'string') return false;

    const codeKeywords = [
        'create', 'make', 'build', 'develop', 'code', 'write', 'generate',
        'html', 'css', 'javascript', 'python', 'java', 'react', 'vue',
        'angular', 'node', 'php', 'sql', 'function', 'class', 'component',
        'script', 'program',
        'algorithm', 'implement', 'coding', 'programming',
        'website', 'app', 'application', 'api', 'database', 'frontend',
        'backend', 'fullstack', 'web development', 'software'
    ];

    const lowerQuery = query.toLowerCase();
    return codeKeywords.some(keyword => lowerQuery.includes(keyword));
};

// Helper function to fetch results from Google Custom Search
async function getGoogleSearchResults(query) {
    if (!googleSearchAPIKey || !GOOGLE_CSE_ID) {
        console.log("Skipping Google Search as API keys are not configured.");
        return { images: [], links: [] };
    }

    if (!query || typeof query !== 'string' || query.trim() === '') {
        console.warn("Google Custom Search API call skipped: Query is empty or invalid.");
        return { images: [], links: [] };
    }

    const encodedQuery = encodeURIComponent(query);
    const imageSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleSearchAPIKey}&cx=${GOOGLE_CSE_ID}&q=${encodedQuery}&searchType=image&num=4`;
    const webSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleSearchAPIKey}&cx=${GOOGLE_CSE_ID}&q=${encodedQuery}&num=3`;

    console.log("Google Image Search URL:", imageSearchUrl);
    console.log("Google Web Search URL:", webSearchUrl);

    let googleImages = [];
    let googleLinks = [];

    try {
        const imageRes = await fetch(imageSearchUrl);
        if (!imageRes.ok) {
            const errorText = await imageRes.text();
            throw new Error(`Google Image Search API error: ${imageRes.status} ${imageRes.statusText} - ${errorText}`);
        }
        const imageData = await imageRes.json();
        if (imageData.items) {
            googleImages = imageData.items.map(item => ({
                src: item.link,
                alt: item.title || "Google Search Image"
            }));
        }
        console.log(`Successfully fetched ${googleImages.length} images.`);
    } catch (error) {
        console.error("Error fetching images from Google Custom Search API:", error.message);
    }

    try {
        const webRes = await fetch(webSearchUrl);
        if (!webRes.ok) {
            const errorText = await webRes.text();
            throw new Error(`Google Web Search API error: ${webRes.status} ${webRes.statusText} - ${errorText}`);
        }
        const webData = await webRes.json();
        if (webData.items) {
            googleLinks = webData.items.map(item => ({
                title: item.title,
                url: item.link,
                snippet: item.snippet
            }));
        }
        console.log(`Successfully fetched ${googleLinks.length} links.`);
    } catch (error) {
        console.error("Error fetching web links from Google Custom Search API:", error.message);
    }
    return { images: googleImages, links: googleLinks };
}

// Helper function to convert image URL to base64 for Gemini API
async function urlToGenerativePart(url) {
    try {
        // Handle data URLs (base64 already)
        if (url.startsWith('data:')) {
            const [mimeTypePart, base64Data] = url.split(',');
            const mimeType = mimeTypePart.split(':')[1].split(';')[0];
            return {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            };
        }

        // Handle external URLs
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from URL: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); // Use Buffer for Node.js
        const mimeType = response.headers.get('content-type');

        if (!mimeType || !mimeType.startsWith('image/')) {
            throw new Error(`Invalid content type for image URL: ${mimeType}`);
        }

        return {
            inlineData: {
                mimeType: mimeType,
                data: buffer.toString('base64')
            }
        };
    } catch (error) {
        console.error("Error converting image URL to generative part:", error);
        return null; // Return null if conversion fails
    }
}

// NEW: Image Proxy Endpoint
app.get('/api/image-proxy', async (req, res) => {
    const imageUrl = req.query.url;

    if (!imageUrl) {
        return res.status(400).send('Image URL is required.');
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            // If the external image is not found or inaccessible, send a placeholder or error
            console.error(`Failed to fetch image from external URL: ${imageUrl}, Status: ${response.status}`);
            return res.status(response.status).send('Failed to fetch image.');
        }

        // Set appropriate headers for the image
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
            res.setHeader('Content-Type', contentType);
        } else {
            // Default to jpeg if content-type is missing or not an image
            res.setHeader('Content-Type', 'image/jpeg'); 
        }
        
        // Cache images for a reasonable time (e.g., 1 day)
        res.setHeader('Cache-Control', 'public, max-age=86400'); 
        
        // Stream the image data directly to the client
        response.body.pipe(res);

    } catch (error) {
        console.error(`Error proxying image ${imageUrl}:`, error.message);
        res.status(500).send('Error serving image.');
    }
});


// API endpoint for search (Gemini AI and Google Search)
app.post('/api/search', async (req, res) => {
    const { query, imageUrl } = req.body;

    if (!query && !imageUrl) {
        console.error("API Search Endpoint Error: Query or imageUrl is required.");
        return res.status(400).json({ error: "Query or image is required." });
    }

    console.log(`Received query for search: "${query}" (Type: ${typeof query})`);
    console.log(`Received imageUrl: "${imageUrl}"`);

    try {
        let geminiPrompt;
        const modelParts = [];

        if (imageUrl) {
            const imagePart = await urlToGenerativePart(imageUrl);
            if (imagePart) {
                modelParts.push(imagePart);
                geminiPrompt = `Analyze the provided image and generate a comprehensive and professional response in Markdown format. Structure your response with clear headings, subheadings, bolding, italics, and bulleted or numbered lists where appropriate. Aim for a detailed and well-organized explanation of the image's content. If the user also provided text, consider it as a guiding context: "${query || 'No additional text query provided.'}"`;
            } else {
                console.warn("Failed to process image URL, proceeding with text-only query.");
                geminiPrompt = `Answer the query "${query}" comprehensively and professionally in Markdown format. Structure your response with clear headings, subheadings, bolding, italics, and bulleted or numbered lists where appropriate. Aim for a detailed and well-organized explanation. If providing facts, cite them as [1], [2] etc. where appropriate.`;
            }
        } else {
            if (isCodeRelatedQuery(query)) {
                geminiPrompt = `Generate ONLY the code for "${query}". Provide the code strictly within a Markdown fenced code block, including the language identifier (e.g., \`\`\`html, \`\`\`javascript, \`\`\`python). Do NOT include any conversational text, explanations, or additional markdown outside of the code block.`;
            } else {
                geminiPrompt = `Answer the query "${query}" comprehensively and professionally in Markdown format. Structure your response with clear headings, subheadings, bolding, italics, and bulleted or numbered lists where appropriate. Aim for a detailed and well-organized explanation. If providing facts, cite them as [1], [2] etc. where appropriate.`;
            }
        }

        modelParts.push({ text: geminiPrompt });

        const geminiResult = await geminiModel.generateContent({
            contents: [{ parts: modelParts }],
            safetySettings: safetySettings
        });
        const geminiResponse = await geminiResult.response;
        const geminiText = geminiResponse.text();

        console.log("Gemini Raw Text Response:", geminiText);

        let googleImages = [];
        let googleLinks = [];
        if (!imageUrl || (query && query.trim() !== '')) {
            const searchResults = await getGoogleSearchResults(query);
            // MODIFICATION HERE: Change image src to use the proxy endpoint
            googleImages = searchResults.images.map(img => ({
                ...img,
                src: `/api/image-proxy?url=${encodeURIComponent(img.src)}` // Use encodeURIComponent for the URL
            }));
            googleLinks = searchResults.links;
            console.log(`Finished Google Search. Fetched ${googleImages.length} images and ${googleLinks.length} links.`);
        } else {
            console.log("Skipping Google Search as it's primarily an image input without a strong text query for external search.");
        }

        let videoThumbnail = null;
        if (query && query.toLowerCase().includes("onlyfans")) {
            videoThumbnail = {
                src: "https://via.placeholder.com/400x225?text=OnlyFans+Video+Placeholder",
                alt: "OnlyFans Video Thumbnail"
            };
        }

        const responseData = {
            answer: {
                text: geminiText,
                videoThumbnail: videoThumbnail
            },
            images: googleImages, // This now contains proxied URLs
            googleLinks: googleLinks
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error in API search endpoint:", error);
        if (error.message.includes("safety settings")) {
            res.status(400).json({ error: "Response blocked due to safety concerns. Please try a different query or image." });
        } else {
            res.status(500).json({ error: "Failed to get response from AI model or Google Search. Please try again." });
        }
    }
});

// --- NEW API Endpoint for Code Compilation ---
app.post('/api/compile', async (req, res) => {
    const { language, sourceCode, stdin } = req.body;

    if (!oneCompilerApiKey) {
        return res.status(500).json({ error: "OneCompiler API key is not configured on the backend." });
    }

    if (!language || !sourceCode) {
        return res.status(400).json({ error: "Language and sourceCode are required for compilation." });
    }

    // Map common languages to OneCompiler's expected file names
    const getFileName = (lang) => {
        switch (lang.toLowerCase()) {
            case 'python': return 'main.py';
            case 'javascript': return 'main.js';
            case 'html': return 'index.html';
            case 'css': return 'style.css'; // CSS needs an HTML wrapper to run meaningfully
            case 'java': return 'Main.java'; // Java typically requires a class named Main
            case 'c': return 'main.c';
            case 'cpp': return 'main.cpp';
            case 'go': return 'main.go';
            case 'php': return 'main.php';
            case 'ruby': return 'main.rb';
            case 'csharp': return 'main.cs';
            case 'typescript': return 'main.ts';
            case 'kotlin': return 'main.kt';
            case 'swift': return 'main.swift';
            case 'rust': return 'main.rs';
            default: return `main.${lang.toLowerCase()}`; // Fallback
        }
    };

    const fileName = getFileName(language);

    try {
        // --- UPDATED RapidAPI Fetch Request ---
        const options = {
            method: 'POST',
            url: 'https://onecompiler-apis.p.rapidapi.com/api/v1/run', // Correct URL from RapidAPI snippet
            headers: {
                'x-rapidapi-key': oneCompilerApiKey, // Your key from .env
                'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com', // Correct host from RapidAPI snippet
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ // Use 'body' with 'JSON.stringify' for fetch
                language: language.toLowerCase(),
                stdin: stdin || '',
                files: [{
                    name: fileName,
                    content: sourceCode
                }]
            })
        };

        const oneCompilerResponse = await fetch(options.url, { // Pass URL and options separately for fetch
            method: options.method,
            headers: options.headers,
            body: options.body
        });
        // --- END UPDATED RapidAPI Fetch Request ---

        const compilerData = await oneCompilerResponse.json();
        console.log("OneCompiler API Response:", compilerData);

        if (compilerData.status === 'success') {
            res.json({
                stdout: compilerData.stdout,
                stderr: compilerData.stderr,
                exception: compilerData.exception,
                executionTime: compilerData.executionTime,
                status: compilerData.status
            });
        } else {
            // OneCompiler returned a 'failed' status or an error
            res.status(400).json({
                error: compilerData.error || compilerData.exception || "Code compilation failed.",
                stdout: compilerData.stdout,
                stderr: compilerData.stderr,
                exception: compilerData.exception,
                status: compilerData.status
            });
        }

    } catch (error) {
        console.error("Error calling OneCompiler API via RapidAPI:", error);
        res.status(500).json({ error: "Failed to connect to compilation service. Please try again." });
    }
});


// --- Use Authentication Routes ---
app.use('/api/auth', authRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});