import express from 'express';
import { generateResponse, streamResponse } from '../services/groqService.js';
import { searchImages } from '../services/searchService.js';
import { generatePDF } from '../services/pdfService.js';

const router = express.Router();

// Detect intent from message
const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('pdf') || lowerMessage.includes('document') || lowerMessage.includes('generate a file')) {
        return 'pdf';
    }

    if (lowerMessage.includes('code') || lowerMessage.includes('create a') ||
        lowerMessage.includes('write a') || lowerMessage.includes('html') ||
        lowerMessage.includes('css') || lowerMessage.includes('javascript') ||
        lowerMessage.includes('python') || lowerMessage.includes('function') ||
        lowerMessage.includes('program')) {
        return 'code';
    }

    return 'general';
};

// Extract search keywords for images
const extractImageKeywords = (message) => {
    // Extract key nouns/topics from the message for image search
    const stopWords = ['what', 'is', 'the', 'a', 'an', 'how', 'why', 'when', 'where', 'who', 'can', 'you', 'tell', 'me', 'about', 'explain', 'show', 'please', 'i', 'want', 'to', 'know', 'of', 'and', 'or', 'in', 'on', 'for', 'with'];
    const words = message.toLowerCase().split(/\s+/).filter(word =>
        word.length > 2 && !stopWords.includes(word)
    );
    return words.slice(0, 3).join(' ') || message.slice(0, 30);
};

// Main chat endpoint
router.post('/', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const intent = detectIntent(message);
        let response = {
            text: '',
            images: [],
            pdf: null,
            intent
        };

        // Generate AI response
        response.text = await generateResponse(message, history);

        // ALWAYS fetch images for all responses (from Wikimedia)
        const imageKeywords = extractImageKeywords(message);
        response.images = await searchImages(imageKeywords, 4);

        // Handle PDF generation
        if (intent === 'pdf') {
            const title = message.replace(/generate|create|make|pdf|document/gi, '').trim() || 'AI Generated Document';
            const pdfResult = await generatePDF(title, response.text);
            response.pdf = pdfResult;
        }

        res.json(response);

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Streaming chat endpoint
router.post('/stream', async (req, res) => {
    try {
        const { message, history = [], imageData } = req.body;

        if (!message && !imageData) {
            return res.status(400).json({ error: 'Message or image is required' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const intent = detectIntent(message || '');

        // Send intent first
        res.write(`data: ${JSON.stringify({ type: 'intent', intent })}\n\n`);

        // Handle image OCR if image is provided
        let queryMessage = message;
        if (imageData) {
            queryMessage = `The user has uploaded an image. ${message || 'Please analyze this image and describe what you see.'}`;
        }

        // Stream text response
        let fullText = '';
        for await (const chunk of streamResponse(queryMessage, history)) {
            fullText += chunk;
            res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
        }

        // ALWAYS send images from Wikimedia with every response
        const imageKeywords = extractImageKeywords(message || 'general topic');
        const images = await searchImages(imageKeywords, 4);
        if (images.length > 0) {
            res.write(`data: ${JSON.stringify({ type: 'images', images })}\n\n`);
        }

        // Generate PDF if applicable
        if (intent === 'pdf') {
            const title = message.replace(/generate|create|make|pdf|document/gi, '').trim() || 'AI Generated Document';
            const pdfResult = await generatePDF(title, fullText);
            res.write(`data: ${JSON.stringify({ type: 'pdf', pdf: pdfResult })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to process message' })}\n\n`);
        res.end();
    }
});

// Image OCR endpoint
router.post('/ocr', async (req, res) => {
    try {
        const { imageData, prompt } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // Send the image to Groq for analysis
        const analysisPrompt = prompt || 'Please analyze this image and extract any text you can see. Describe the content.';
        const response = await generateResponse(analysisPrompt + '\n\n[User uploaded an image for analysis]', []);

        res.json({
            text: response,
            success: true
        });

    } catch (error) {
        console.error('OCR error:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// Search images endpoint
router.get('/images', async (req, res) => {
    try {
        const { q, count = 4 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const images = await searchImages(q, Math.min(parseInt(count), 4));
        res.json({ images });

    } catch (error) {
        console.error('Image search error:', error);
        res.status(500).json({ error: 'Failed to search images' });
    }
});

export default router;
