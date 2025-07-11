// ai-layout-project/backend/server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fetch from 'node-fetch';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import settingRoutes from './routes/settings.js'

// <--- REQUIRED IMPORTS FOR FILE SYSTEM AND PDF OPERATIONS (for Node.js PDFKit) --->
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit'; // For generating PDFs directly in Node.js
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // For unique PDF filenames
// <--- END REQUIRED IMPORTS --->

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// --- Connect Database ---
connectDB();

const allowedOrigins = [
    'http://localhost:5173',
    'https://nexus-aichat.netlify.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ extended: false, limit: '50mb' }));

// <--- ADDED: Directory for generated PDFs and static serving (Crucial for PDF display) --->
const GENERATED_PDF_DIR = path.join(__dirname, 'generated_pdfs');

// Ensure the directory exists
if (!fs.existsSync(GENERATED_PDF_DIR)) {
    fs.mkdirSync(GENERATED_PDF_DIR);
    console.log(`Created directory for generated PDFs: ${GENERATED_PDF_DIR}`);
}

// Serve static files from the 'generated_pdfs' directory
// This makes PDFs accessible at e.g., http://localhost:5000/generated_pdfs/your-file.pdf
app.use('/generated_pdfs', express.static(GENERATED_PDF_DIR));
// <--- END ADDED --->

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
}

// --- Configure OneCompiler API ---
const oneCompilerApiKey = process.env.ONECOMPILER_API_KEY;
if (!oneCompilerApiKey) {
    console.warn("ONECOMPILER_API_KEY not found in .env file. Code compilation will not work.");
}

function isPureCodeResponse(text) {
    return text?.trim().startsWith("```") && text?.trim().endsWith("```");
}


// Helper function to check if query contains code-related terms
const isCodeRelatedQuery = (query) => {
    if (!query || typeof query !== 'string') return false;
    const codeKeywords = [
        'create', 'make', 'build', 'develop', 'code', 'write', 'generate',
        'html', 'css', 'javascript', 'python', 'java', 'react', 'vue',
        'angular', 'node', 'php', 'sql', 'function', 'class', 'component',
        'script', 'program', 'algorithm', 'implement', 'coding', 'programming',
        'website', 'app', 'application', 'api', 'database', 'frontend',
        'backend', 'fullstack', 'web development', 'software'
    ];
    const lowerQuery = query.toLowerCase();
    return codeKeywords.some(keyword => lowerQuery.includes(keyword));
};

function isPdfRequested(query = '') {
    const pdfTriggers = [
        'make a pdf',
        'generate pdf',
        'create pdf',
        'pdf file',
        'download as pdf',
        'save as pdf',
        'make notes as pdf',
        'pdf of this',
        'export as pdf',
        'generate a pdf for',
        'give me a pdf',
    ];

    const lowerQuery = query.toLowerCase();
    return pdfTriggers.some(phrase => lowerQuery.includes(phrase));
}


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

// NEW: Image Proxy Endpoint (keeps external images secure and prevents CORS issues)
app.get('/api/image-proxy', async (req, res) => {
    const imageUrl = req.query.url;

    if (!imageUrl) {
        console.error("Image Proxy Error: No imageUrl provided in query.");
        return res.status(400).send('Image URL is required.');
    }

    try {
        // Log the URL being fetched by the proxy
        console.log(`Image Proxy: Attempting to fetch external image: ${imageUrl}`);

        // Add a User-Agent header to mimic a browser, which can help bypass some anti-hotlinking measures
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            // Log detailed error if external fetch fails
            console.error(`Image Proxy Error: Failed to fetch image from external URL: ${imageUrl}`);
            console.error(`Image Proxy Error: Status: ${response.status}, StatusText: ${response.statusText}`);
            // Attempt to read and log response body if it's not too large and might contain error details
            try {
                const errorBody = await response.text();
                console.error(`Image Proxy Error: External response body: ${errorBody.substring(0, 500)}... (truncated)`);
            } catch (bodyError) {
                console.error(`Image Proxy Error: Could not read external response body: ${bodyError.message}`);
            }
            return res.status(response.status).send('Failed to fetch image from external source.');
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
            res.setHeader('Content-Type', contentType);
        } else {
            // Fallback content type if original is missing or not image, but log a warning
            console.warn(`Image Proxy Warning: No image content-type for ${imageUrl}. Falling back to image/jpeg.`);
            res.setHeader('Content-Type', 'image/jpeg');
        }

        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        response.body.pipe(res); // Pipe the stream directly

    } catch (error) {
        // Log general network or other errors during proxying
        console.error(`Image Proxy Critical Error for ${imageUrl}:`, error.message);
        // Log the full error object for more details
        console.error(error);
        res.status(500).send('Error serving image through proxy.');
    }
});


// MAIN API endpoint for AI search and data retrieval
app.post('/api/search', async (req, res) => {
    const { query, imageUrl } = req.body;

    if (!query && !imageUrl) {
        console.error("API Search Endpoint Error: Query or imageUrl is required.");
        return res.status(400).json({ error: "Query or image is required." });
    }

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
            // MODIFIED LOGIC FOR GEMINI PROMPT CONSTRUCTION
            if (isPdfRequested(query)) {
                const contentQuery = query.replace(/(make a pdf|generate pdf|create pdf|pdf file|download as pdf|save as pdf|make notes as pdf|pdf of this|export as pdf|generate a pdf for|give me a pdf)/gi, '').trim();
                geminiPrompt = `Generate comprehensive and professional content in Markdown format based on the following request: "${contentQuery || query}". Structure your response with clear headings, subheadings, bolding, italics, and bulleted or numbered lists where appropriate. Aim for a detailed and well-organized explanation. This content will be used to generate a PDF, so ensure it is suitable for a document.`;
            } else if (isCodeRelatedQuery(query)) {
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

        let googleImages = [];
        let googleLinks = [];
        if (!imageUrl || (query && query.trim() !== '')) {
            const searchResults = await getGoogleSearchResults(query);
            googleImages = searchResults.images.map(img => ({
                ...img,

                src: img.src
            }));
            googleLinks = searchResults.links;
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
                videoThumbnail: videoThumbnail,
            },
            images: googleImages,
            googleLinks: googleLinks
        };

        if (isPdfRequested(query) && !isPureCodeResponse(geminiText)) {
            try {

                const pdfResponse = await fetch(`http://localhost:${port}/api/generate-pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        textContent: geminiText, // Use the content generated by Gemini
                        originalQuery: query,
                        googleLinks: googleLinks
                    })
                });

                if (pdfResponse.ok) {
                    const pdfData = await pdfResponse.json();
                    responseData.pdfUrl = pdfData.pdfUrl;
                } else {
                    console.warn("PDF generation failed");
                    responseData.pdfUrl = null;
                }
            } catch (err) {
                console.error("Error generating PDF automatically:", err.message);
                responseData.pdfUrl = null;
            }
        } else {
            console.log("⚠️ Skipping PDF generation due to code-only response or no PDF intent.");
        }

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


// API endpoint for Code Compilation (using OneCompiler API)
// API endpoint for Code Compilation (using OneCompiler API)
// Inside your /api/compile endpoint

app.post('/api/compile', async (req, res) => {
    const { language, sourceCode, stdin } = req.body;

    if (!oneCompilerApiKey) {
        console.error("DEBUG: ONECOMPILER_API_KEY is not set. Returning 500."); // Added debug log
        return res.status(500).json({
            error: "OneCompiler API key is not configured on the backend.",
            solution: "Please set ONECOMPILER_API_KEY in your .env file"
        });
    }

    // Validate required fields (already good)
    if (!language || !sourceCode) {
        console.error("DEBUG: Missing language or sourceCode. Returning 400."); // Added debug log
        return res.status(400).json({
            error: "Missing required fields",
            required: ["language", "sourceCode"],
            received: Object.keys(req.body)
        });
    }

    // Validate language (already good)
    const supportedLanguages = [
        'python', 'javascript', 'java', 'c', 'cpp', 'go',
        'php', 'ruby', 'csharp', 'typescript', 'kotlin',
        'swift', 'rust', 'html', 'css'
    ];
    if (!supportedLanguages.includes(language.toLowerCase())) {
        console.error(`DEBUG: Unsupported language received: ${language}. Returning 400.`); // Added debug log
        return res.status(400).json({
            error: "Unsupported language",
            supportedLanguages,
            received: language
        });
    }

    try {
        console.log(`DEBUG: Attempting to call OneCompiler API for language: ${language}`); // Debug log before fetch
        const response = await fetch('https://api.onecompiler.com/v1/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${oneCompilerApiKey}`
            },
            body: JSON.stringify({
                language: language.toLowerCase(),
                stdin: stdin || '',
                files: [{
                    name: `main.${language.toLowerCase()}`,
                    content: sourceCode
                }]
            })
        });

        // Log raw response status for debugging
        console.log(`DEBUG: OneCompiler API Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorBody = await response.text(); // Read raw text for more info
            let parsedError = {};
            try {
                parsedError = JSON.parse(errorBody); // Try parsing as JSON
            } catch (e) {
                parsedError.raw = errorBody; // If not JSON, store raw text
            }
            console.error('DEBUG: OneCompiler API returned non-OK status:', {
                status: response.status,
                statusText: response.statusText,
                apiError: parsedError // Log the parsed or raw error body
            });

            return res.status(response.status).json({
                error: parsedError.message || "Compilation failed from OneCompiler API",
                apiResponse: parsedError
            });
        }

        const data = await response.json(); // This line will throw if response is not valid JSON

        console.log('DEBUG: OneCompiler API call successful. Returning data.'); // Debug log on success
        return res.json({
            success: true,
            stdout: data.stdout,
            stderr: data.stderr,
            executionTime: data.executionTime,
            memoryUsage: data.memory,
            status: data.status
        });

    } catch (error) {
        console.error("DEBUG: Compilation Service Error caught in backend:", {
            message: error.message,
            name: error.name, // Log error type
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Check if the error is a network error
        if (error.name === 'FetchError' || error.message.includes('network')) {
            return res.status(504).json({ // Use 504 Gateway Timeout for network issues
                error: "Network error when connecting to compilation service. Please check internet connection.",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        return res.status(503).json({
            error: "Compilation service unavailable",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            solution: "Please try again later or check your API key"
        });
    }
});
// DEDICATED API endpoint for PDF Generation (uses Node.js PDFKit)
// IMPROVED PDF Generation endpoint with better formatting
app.post('/api/generate-pdf', async (req, res) => {
    const { textContent, originalQuery, googleLinks } = req.body;

    if (!textContent || textContent.trim() === '') {
        return res.status(400).json({ error: "Text content is required to generate a PDF." });
    }

    try {
        const doc = new PDFDocument({
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            size: 'A4'
        });

        const uniqueId = uuidv4();
        const pdfFileName = `response_${uniqueId}.pdf`;
        const pdfFilePath = path.join(GENERATED_PDF_DIR, pdfFileName);

        doc.pipe(fs.createWriteStream(pdfFilePath));

        // Add query as a main title with better styling
        doc.fontSize(22)
            .font('Helvetica-Bold')
            .fillColor('#1a237e')
            .text(`Query: ${originalQuery || 'AI Response'}`, { align: 'center', underline: true });

        doc.moveDown(1);

        // Add a separator line
        doc.moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .strokeColor('#90caf9')
            .lineWidth(1.5)
            .stroke();

        doc.moveDown(1.5);

        // --- Enhanced Markdown Parsing and PDFKit Formatting Logic ---
        const lines = textContent.split('\n');
        let inCodeBlock = false;
        let codeBlockContent = [];
        const defaultFontSize = 12;
        const defaultFont = 'Helvetica';
        const pageWidth = doc.page.width - 100; // Account for margins

        // Helper function to check if we need a new page
        const checkPageBreak = (additionalHeight = 0) => {
            if (doc.y + additionalHeight > doc.page.height - 100) {
                doc.addPage();
                return true;
            }
            return false;
        };

        // Helper function to process inline markdown (bold, italic, code, links)
        const processInlineMarkdown = (text, options = {}) => {
            if (!text) return;

            // Replace markdown links [text](url) with just text (for PDF, clickable links handled below)
            let linkMatches = [];
            let replacedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, p1, p2) => {
                linkMatches.push({ text: p1, url: p2 });
                return `[[LINK_${linkMatches.length - 1}]]`;
            });

            // Split text by markdown patterns while preserving the delimiters
            const parts = replacedText.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
            let isFirstPart = true;

            parts.forEach(part => {
                if (!part) return;

                // Handle replaced links
                const linkMatch = part.match(/\[\[LINK_(\d+)\]\]/);
                if (linkMatch) {
                    const idx = parseInt(linkMatch[1]);
                    const linkObj = linkMatches[idx];
                    if (linkObj) {
                        doc.font('Helvetica-Bold')
                            .fillColor('#1565c0')
                            .text(linkObj.text, { ...options, link: linkObj.url, underline: true, continued: true });
                        doc.fillColor('black');
                    }
                } else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                    // Bold text
                    doc.font('Helvetica-Bold')
                        .text(part.slice(2, -2), { ...options, continued: true });
                } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                    // Italic text
                    doc.font('Helvetica-Oblique')
                        .text(part.slice(1, -1), { ...options, continued: true });
                } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
                    // Inline code
                    doc.font('Courier')
                        .fillColor('#e74c3c')
                        .text(part.slice(1, -1), { ...options, continued: true })
                        .fillColor('black');
                } else {
                    // Regular text
                    doc.font(defaultFont)
                        .text(part, { ...options, continued: !isFirstPart || parts.length > 1 });
                }
                isFirstPart = false;
            });

            // End the line if we had continued text
            if (parts.length > 1) {
                doc.text('');
            }
        };

        let listType = null;
        let listIndex = 1;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Skip empty lines but add some spacing
            if (!trimmedLine) {
                if (index > 0 && lines[index - 1].trim()) {
                    doc.moveDown(0.4);
                }
                listType = null;
                listIndex = 1;
                return;
            }

            // Check for code block start/end
            if (trimmedLine.startsWith('```')) {
                if (inCodeBlock) {
                    // End of code block
                    inCodeBlock = false;

                    if (codeBlockContent.length > 0) {
                        checkPageBreak(codeBlockContent.length * 14 + 24);

                        const codeText = codeBlockContent.join('\n');
                        const codeHeight = codeBlockContent.length * 14 + 24;

                        // Draw code block background with border
                        doc.save();
                        doc.rect(doc.x - 8, doc.y - 6, pageWidth + 16, codeHeight)
                            .fillColor('#f5f5f5')
                            .strokeColor('#bdbdbd')
                            .lineWidth(0.7)
                            .fillAndStroke();
                        doc.restore();

                        // Add code text
                        doc.fillColor('#263238')
                            .fontSize(11)
                            .font('Courier')
                            .text(codeText, doc.x, doc.y, {
                                width: pageWidth,
                                align: 'left',
                                lineGap: 2
                            });

                        doc.moveDown(1);
                        codeBlockContent = [];

                        // Reset to default formatting
                        doc.font(defaultFont)
                            .fontSize(defaultFontSize)
                            .fillColor('black');
                    }
                } else {
                    // Start of code block
                    inCodeBlock = true;
                    doc.moveDown(0.5);
                }
                return;
            }

            if (inCodeBlock) {
                codeBlockContent.push(line);
                return;
            }

            // Headings
            if (trimmedLine.startsWith('### ')) {
                checkPageBreak(30);
                doc.moveDown(0.7)
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#3949ab')
                    .text(trimmedLine.substring(4), { width: pageWidth })
                    .moveDown(0.4);
                listType = null;
                listIndex = 1;
            } else if (trimmedLine.startsWith('## ')) {
                checkPageBreak(35);
                doc.moveDown(0.9)
                    .fontSize(16)
                    .font('Helvetica-Bold')
                    .fillColor('#1e88e5')
                    .text(trimmedLine.substring(3), { width: pageWidth })
                    .moveDown(0.5);
                listType = null;
                listIndex = 1;
            } else if (trimmedLine.startsWith('# ')) {
                checkPageBreak(40);
                doc.moveDown(1.1)
                    .fontSize(18)
                    .font('Helvetica-Bold')
                    .fillColor('#0d47a1')
                    .text(trimmedLine.substring(2), { width: pageWidth })
                    .moveDown(0.7);
                listType = null;
                listIndex = 1;
            }
            // Unordered lists
            else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                checkPageBreak(20);
                if (listType !== 'ul') {
                    listType = 'ul';
                    listIndex = 1;
                }
                doc.fontSize(defaultFontSize)
                    .font(defaultFont)
                    .fillColor('black');

                const listContent = trimmedLine.substring(2).trim();
                const bulletX = doc.x;
                const textX = doc.x + 18;

                // Draw bullet point
                doc.save();
                doc.circle(bulletX + 4, doc.y + 7, 2.5)
                    .fillColor('#1976d2')
                    .fill();
                doc.restore();

                // Add list item text
                doc.fillColor('black')
                    .font(defaultFont)
                    .fontSize(defaultFontSize)
                    .text(listContent, textX, doc.y, {
                        width: pageWidth - 18,
                        indent: 0,
                        paragraphGap: 0
                    });

                doc.moveDown(0.2);
            }
            // Ordered lists
            else if (/^\d+\.\s/.test(trimmedLine)) {
                checkPageBreak(20);
                if (listType !== 'ol') {
                    listType = 'ol';
                    listIndex = 1;
                }
                const listItemMatch = trimmedLine.match(/^(\d+)\.\s(.*)/);
                if (listItemMatch) {
                    doc.fontSize(defaultFontSize)
                        .font(defaultFont)
                        .fillColor('black');

                    const number = listItemMatch[1];
                    const content = listItemMatch[2];
                    const numberX = doc.x;
                    const textX = doc.x + 22;

                    // Add number
                    doc.font('Helvetica-Bold')
                        .fillColor('#1976d2')
                        .text(`${number}.`, numberX, doc.y, { width: 18 });

                    // Add content
                    doc.font(defaultFont)
                        .fillColor('black')
                        .text(content, textX, doc.y, {
                            width: pageWidth - 22,
                            indent: 0,
                            paragraphGap: 0
                        });

                    doc.moveDown(0.2);
                    listIndex++;
                }
            }
            // Blockquotes
            else if (trimmedLine.startsWith('> ')) {
                checkPageBreak(25);
                const quoteContent = trimmedLine.substring(2);

                // Draw quote bar
                doc.save();
                doc.rect(doc.x, doc.y, 4, 22)
                    .fillColor('#64b5f6')
                    .fill();
                doc.restore();

                // Add quote text
                doc.fillColor('#607d8b')
                    .font('Helvetica-Oblique')
                    .fontSize(defaultFontSize)
                    .text(quoteContent, doc.x + 14, doc.y, {
                        width: pageWidth - 14
                    });

                doc.moveDown(0.5);
                listType = null;
                listIndex = 1;
            }
            // Horizontal rules
            else if (trimmedLine === '---' || trimmedLine === '***') {
                checkPageBreak(15);
                doc.moveDown(0.5)
                    .moveTo(doc.x, doc.y)
                    .lineTo(doc.x + pageWidth, doc.y)
                    .strokeColor('#bdbdbd')
                    .lineWidth(1)
                    .stroke()
                    .moveDown(0.5);
                listType = null;
                listIndex = 1;
            }
            // Regular paragraphs
            else {
                checkPageBreak(20);
                doc.fontSize(defaultFontSize)
                    .fillColor('black');

                // Process the line for inline markdown
                processInlineMarkdown(trimmedLine, {
                    width: pageWidth,
                    align: 'left',
                    lineGap: 3
                });

                doc.moveDown(0.3);
                listType = null;
                listIndex = 1;
            }
        });

        // Add Google links if provided
        if (googleLinks && googleLinks.length > 0) {
            checkPageBreak(100);

            doc.moveDown(2)
                .fontSize(16)
                .font('Helvetica-Bold')
                .fillColor('#0d47a1')
                .text('Relevant Links:', { underline: true })
                .moveDown(1);

            googleLinks.forEach((link, index) => {
                checkPageBreak(40);

                // Link title
                doc.fontSize(12)
                    .font('Helvetica-Bold')
                    .fillColor('#1976d2')
                    .text(`${index + 1}. ${link.title || 'Link'}`, {
                        width: pageWidth
                    });

                // Link URL
                if (link.url) {
                    doc.fontSize(10)
                        .font('Helvetica')
                        .fillColor('#1565c0')
                        .text(link.url, {
                            link: link.url,
                            width: pageWidth,
                            underline: true
                        });
                }

                // Link snippet
                if (link.snippet) {
                    doc.fontSize(10)
                        .font('Helvetica')
                        .fillColor('#607d8b')
                        .text(link.snippet, {
                            width: pageWidth,
                            indent: 10
                        });
                }

                doc.moveDown(0.7);
            });
        }

        // Add footer with page numbers (safer approach)
        const range = doc.bufferedPageRange();
        if (range && range.count > 0) {
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                    .font('Helvetica')
                    .fillColor('#bdbdbd')
                    .text(`Page ${i - range.start + 1} of ${range.count}`,
                        50,
                        doc.page.height - 30,
                        { align: 'center', width: doc.page.width - 100 });
            }
        }

        doc.end();

        const pdfUrl = `http://localhost:${port}/generated_pdfs/${pdfFileName}`;
        console.log(`Generated PDF: ${pdfFilePath} with improved formatting`);

        res.json({ pdfUrl: pdfUrl });

    } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        res.status(500).json({ error: "An unexpected server error occurred during PDF generation." });
    }
});
// --- Use Authentication Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/settings' , settingRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
