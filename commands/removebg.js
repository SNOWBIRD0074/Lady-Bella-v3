const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
    // 1) Quoted image (highest priority)
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    // 2) Image in the current message
    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    return null;
}

module.exports = {
    name: 'removebg',
    alias: ['rmbg', 'nobg'],
    category: 'general',
    desc: 'Remove background from images',
    async exec(sock, message, args) {
        try {
            const chatId = message.key.remoteJid;
            let imageUrl = null;
            
            // Check if args contain a URL
            if (args.length > 0) {
                const url = args.join(' ');
                if (isValidUrl(url)) {
                    imageUrl = url;
                } else {
                    return sock.sendMessage(chatId, { 
                        text: '❌ Invalid URL provided.\n\nUsage: `.removebg https://example.com/image.jpg`' 
                    }, { quoted: message });
                }
            } else {
                // Try to get image from message or quoted message
                imageUrl = await getQuotedOrOwnImageUrl(sock, message);
                
                if (!imageUrl) {
                    return sock.sendMessage(chatId, { 
                        text: '📸 *Remove Background Command*\n\nUsage:\n• `.removebg <image_url>`\n• Reply to an image with `.removebg`\n• Send image with `.removebg`\n\nExample: `.removebg https://example.com/image.jpg`' 
                    }, { quoted: message });
                }
            }

        
            // Call the remove background API
            const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;
            
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 30000, // 30 second timeout
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.status === 200 && response.data) {
                // Send the processed image
                await sock.sendMessage(chatId, {
                    image: response.data,
                    caption: '✨ *Background removed successfully!*\n\nPOWERED BY SNOWBIRD'
                }, { quoted: message });
            } else {
                throw new Error('Failed to process image');
            }

        } catch (error) {
            console.error('RemoveBG Error:', error.message);
            
            let errorMessage = '❌ Failed to remove background.';
            
            if (error.response?.status === 429) {
                errorMessage = '⏰ Rate limit exceeded. Please try again later.';
            } else if (error.response?.status === 400) {
                errorMessage = '❌ Invalid image URL or format.';
            } else if (error.response?.status === 500) {
                errorMessage = '🔧 Server error. Please try again later.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = '⏰ Request timeout. Please try again.';
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
                errorMessage = '🌐 Network error. Please check your connection.';
            }
            
            await sock.sendMessage(chatId, { 
                text: errorMessage 
            }, { quoted: message });
        }
    }
};

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
