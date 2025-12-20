import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const generateResponse = async (message, conversationHistory = []) => {
    try {
        const messages = [
            {
                role: 'system',
                content: `You are Nexus AI, a helpful, intelligent, and friendly assistant. 
                
Guidelines:
- Provide clear, well-structured responses
- Use markdown formatting when helpful (headers, lists, code blocks)
- Be concise but thorough
- If asked to generate code, provide complete, working examples with proper syntax highlighting
- If asked to create a PDF or document, acknowledge the request and provide the content you would include
- Be conversational and engaging`
            },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 4096,
            stream: false
        });

        return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
        console.error('Groq API error:', error);
        throw error;
    }
};

export const streamResponse = async function* (message, conversationHistory = []) {
    try {
        const messages = [
            {
                role: 'system',
                content: `You are Nexus AI, a helpful, intelligent, and friendly assistant.
                
Guidelines:
- Provide clear, well-structured responses
- Use markdown formatting when helpful (headers, lists, code blocks)
- Be concise but thorough
- If asked to generate code, provide complete, working examples
- Be conversational and engaging`
            },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        const stream = await groq.chat.completions.create({
            messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 4096,
            stream: true
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    } catch (error) {
        console.error('Groq streaming error:', error);
        throw error;
    }
};
